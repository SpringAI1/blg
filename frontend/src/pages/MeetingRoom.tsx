import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Spin, App, Tag, Space, Avatar, Input, Empty, Badge, Upload, Tooltip, Popconfirm, Grid } from 'antd';
import {
  ArrowLeftOutlined, UserOutlined, TeamOutlined, ClockCircleOutlined,
  SendOutlined, VideoCameraOutlined, AudioOutlined, AudioMutedOutlined,
  VideoCameraAddOutlined, StopOutlined, FileTextOutlined,
  DownloadOutlined, MonitorOutlined, PaperClipOutlined, DeleteOutlined,
  FilePdfOutlined, FileZipOutlined, FileImageOutlined, FileUnknownOutlined,
  EnvironmentOutlined, InfoCircleOutlined, KeyOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { meetingApi, Meeting, MeetingParticipant } from '@/api/meeting';
import { fileApi } from '@/api/file';
import { useAuthStore } from '@/store/auth';
import { Client } from '@stomp/stompjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ChatMessage {
  id: string; sender: string; senderId?: number; content: string; timestamp: string; type: 'JOIN' | 'LEAVE' | 'CHAT' | 'SYSTEM';
}
interface SharedFile { id: string; name: string; size: string; url: string; uploadedBy: string; uploadedById?: number; timestamp: string; }

const STUN_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

const FILE_ICON_MAP: Record<string, any> = {
  pdf: FilePdfOutlined, zip: FileZipOutlined, rar: FileZipOutlined, '7z': FileZipOutlined,
  png: FileImageOutlined, jpg: FileImageOutlined, jpeg: FileImageOutlined, gif: FileImageOutlined, webp: FileImageOutlined,
  svg: FileImageOutlined, doc: FileTextOutlined, docx: FileTextOutlined, xls: FileTextOutlined, xlsx: FileTextOutlined,
  ppt: FileTextOutlined, pptx: FileTextOutlined, txt: FileTextOutlined,
};

const getFileIcon = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const Icon = FILE_ICON_MAP[ext] || FileUnknownOutlined;
  return <Icon style={{ fontSize: 24, color: '#1677ff' }} />;
};

const formatSize = (bytes: number) => {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + 'MB';
  return (bytes / 1024).toFixed(1) + 'KB';
};

const MeetingRoom = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { message } = App.useApp();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<MeetingParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [showFilePanel, setShowFilePanel] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState<{ userId: string; stream: MediaStream }[]>([]);

  const stompRef = useRef<Client | null>(null);
  const subsRef = useRef<{ unsubscribe: () => void }[]>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const chatEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const joinedRef = useRef(false);
  const joinedNotifiedRef = useRef(false);

  useEffect(() => { if (id) fetchData(); return () => cleanupAll(); }, [id]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [m, p] = await Promise.all([
        meetingApi.getById(Number(id)),
        meetingApi.getParticipants(Number(id)),
      ]);
      setMeeting(m); setParticipants(p || []);
      if (isAuthenticated) {
        const joined = await meetingApi.checkJoined(Number(id));
        setHasJoined(joined);
        joinedRef.current = joined;
        if (joined) connectWebSocket();
      }
    } catch { message.error('加载会议失败'); } finally { setLoading(false); }
  };

  const cleanupAll = () => {
    stompRef.current?.deactivate();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
  };

  // ---------- WebSocket ----------
  const connectWebSocket = () => {
    const token = localStorage.getItem('token');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname === 'localhost' ? 'localhost:8080' : window.location.host}/ws`;

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 3000,
      heartbeatIncoming: 10000, heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnected(true);
        // 防止重连时重复添加通知消息和 JOIN 消息
        if (!joinedNotifiedRef.current) {
          addChatMsg('SYSTEM', '已连接到会议');
          if (joinedRef.current) {
            sendWs('JOIN', `${user?.nickname || user?.username} 加入了会议`);
          }
          joinedNotifiedRef.current = true;
        }

        // 取消旧订阅，防止重连后重复订阅导致消息重复
        subsRef.current.forEach(s => s.unsubscribe());
        const subs: any[] = [];

        subs.push(client.subscribe(`/topic/meeting/${id}`, (msg) => {
          try { const c: ChatMessage = JSON.parse(msg.body); setChatMessages(p => [...p, c]); } catch { /* */ }
        }));
        subs.push(client.subscribe(`/topic/meeting/${id}/signal`, (msg) => {
          try { handleSignal(JSON.parse(msg.body)); } catch { /* */ }
        }));
        subs.push(client.subscribe(`/topic/meeting/${id}/file`, (msg) => {
          try {
            const f: SharedFile = JSON.parse(msg.body);
            if (!f.id) f.id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            setSharedFiles(p => [...p, f]);
            if (f.uploadedById !== user?.id) message.info(`${f.uploadedBy} 分享了文件`);
          } catch { /* */ }
        }));
        subsRef.current = subs;

        sendSignal({ type: 'request-offers', from: user?.id });
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    });
    client.activate();
    stompRef.current = client;
  };

  const sendWs = (type: string, content: string) => {
    if (!stompRef.current?.connected) return;
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      sender: user?.nickname || user?.username || '匿名', senderId: user?.id,
      content, timestamp: dayjs().format('HH:mm:ss'), type: type as any,
    };
    stompRef.current.publish({ destination: `/app/meeting/${id}`, body: JSON.stringify(msg) });
    // 不本地添加，等 WebSocket 回显后自动显示（避免重复 key）
  };

  const addChatMsg = (type: string, content: string) => {
    const msg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      sender: '系统', content, timestamp: dayjs().format('HH:mm:ss'), type: type as any,
    };
    setChatMessages(p => [...p, msg]);
  };

  const sendSignal = (data: any) => {
    if (!stompRef.current?.connected) return;
    stompRef.current.publish({ destination: `/app/meeting/${id}/signal`, body: JSON.stringify(data) });
  };

  // ---------- Join / Leave ----------
  const handleJoin = async () => {
    if (!isAuthenticated) { message.warning('请先登录'); return; }
    setJoining(true);
    try {
      await meetingApi.join(Number(id));
      setHasJoined(true);
      joinedRef.current = true;
      message.success('已加入会议');
      const p = await meetingApi.getParticipants(Number(id));
      setParticipants(p || []);
      connectWebSocket(); // WebSocket onConnect 里会发送 JOIN 消息
    } catch (err: any) { message.error(err.message || '加入失败'); } finally { setJoining(false); }
  };

  const handleLeave = async () => {
    sendWs('LEAVE', `${user?.nickname || user?.username} 离开了会议`);
    setTimeout(() => {
      stopVideo(); stopScreenShare();
      try { meetingApi.leave(Number(id)); } catch { /* */ }
      stompRef.current?.deactivate(); setConnected(false); setHasJoined(false);
      joinedNotifiedRef.current = false;
      message.success('已离开会议');
      navigate('/tech-meeting');
    }, 200);
  };

  const handleEndMeeting = async () => {
    sendWs('SYSTEM', '主持人结束了会议');
    setTimeout(async () => {
      stopVideo(); stopScreenShare();
      try {
        await meetingApi.leave(Number(id));
        // 通过更新接口将会议状态设为已结束
        await meetingApi.update(Number(id), { status: 'ENDED' });
      } catch { /* */ }
      stompRef.current?.deactivate(); setConnected(false); setHasJoined(false);
      joinedNotifiedRef.current = false;
      message.success('会议已结束');
      navigate('/tech-meeting');
    }, 200);
  };

  // ---------- WebRTC ----------
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: !audioOn });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setVideoOn(true);
      if (!audioOn) setAudioOn(true);
      sendWs('SYSTEM', `${user?.nickname || user?.username} 开启了视频`);
      sendSignal({ type: 'video-on', from: user?.id });
      message.success('摄像头已开启');
    } catch (err: any) { message.error(err.message || '无法开启摄像头'); }
  };

  const stopVideo = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    setVideoOn(false); setAudioOn(false); setRemoteStreams([]);
  };

  const startAudio = async () => {
    try {
      if (!localStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
      }
      const enabled = !audioOn;
      localStreamRef.current.getAudioTracks().forEach(t => t.enabled = enabled);
      setAudioOn(enabled);
      if (enabled) sendWs('SYSTEM', `${user?.nickname || user?.username} 开启了麦克风`);
    } catch (err: any) { message.error(err.message || '无法开启麦克风'); }
  };

  const toggleAudio = () => {
    if (audioOn && localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => t.enabled = false);
      setAudioOn(false);
      return;
    }
    startAudio();
  };

  const toggleVideo = () => {
    if (!videoOn) { startVideo(); return; }
    if (localStreamRef.current) {
      const enabled = !videoOn;
      localStreamRef.current.getVideoTracks().forEach(t => t.enabled = enabled);
      setVideoOn(enabled);
      if (!enabled && localVideoRef.current) localVideoRef.current.srcObject = null;
    }
  };

  const createPeerConnection = (userId: string, initiator: boolean): RTCPeerConnection | null => {
    if (peerConnections.current.has(userId)) return null;
    const pc = new RTCPeerConnection(STUN_SERVERS);
    peerConnections.current.set(userId, pc);
    localStreamRef.current?.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current!));

    pc.onicecandidate = (e) => {
      if (e.candidate && stompRef.current?.connected) {
        stompRef.current.publish({
          destination: `/app/meeting/${id}/signal`,
          body: JSON.stringify({ type: 'ice', candidate: e.candidate, from: user?.id, to: userId }),
        });
      }
    };
    pc.ontrack = (e) => {
      setRemoteStreams(prev => {
        const exists = prev.find(s => s.userId === userId);
        if (exists) return prev.map(s => s.userId === userId ? { ...s, stream: e.streams[0] } : s);
        return [...prev, { userId, stream: e.streams[0] }];
      });
    };
    if (initiator) {
      pc.createOffer().then(offer => {
        pc.setLocalDescription(offer);
        stompRef.current?.publish({
          destination: `/app/meeting/${id}/signal`,
          body: JSON.stringify({ type: 'offer', sdp: offer, from: user?.id, to: userId }),
        });
      });
    }
    return pc;
  };

  const handleSignal = useCallback(async (signal: any) => {
    const fromId = signal.from;
    if (fromId === user?.id) return;
    if (signal.type === 'offer') {
      const pc = createPeerConnection(fromId, false);
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal({ type: 'answer', sdp: answer, from: user?.id, to: fromId });
    } else if (signal.type === 'answer') {
      const pc = peerConnections.current.get(fromId);
      if (pc && pc.signalingState !== 'stable') await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
    } else if (signal.type === 'ice') {
      const pc = peerConnections.current.get(fromId);
      if (pc) { try { await pc.addIceCandidate(new RTCIceCandidate(signal.candidate)); } catch { /* */ } }
    } else if (signal.type === 'video-on' || signal.type === 'request-offers') {
      if (localStreamRef.current) createPeerConnection(fromId, true);
    }
  }, [id, user?.id]);

  // ---------- Screen Share ----------
  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (!localStreamRef.current) {
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setVideoOn(true);
      } else { if (localVideoRef.current) localVideoRef.current.srcObject = stream; }
      screenStreamRef.current = stream; setScreenSharing(true);
      sendWs('SYSTEM', `${user?.nickname || user?.username} 开始共享屏幕`);
      const videoTrack = stream.getVideoTracks()[0];
      peerConnections.current.forEach(pc => { const s = pc.getSenders().find(s => s.track?.kind === 'video'); if (s) s.replaceTrack(videoTrack); });
      videoTrack.onended = () => stopScreenShare();
    } catch { message.warning('屏幕共享已取消'); }
  };

  const stopScreenShare = () => {
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null; setScreenSharing(false);
    if (!localStreamRef.current?.getVideoTracks().length) {
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      setVideoOn(false); sendWs('SYSTEM', `${user?.nickname || user?.username} 停止了屏幕共享`);
      return;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    peerConnections.current.forEach(pc => { const s = pc.getSenders().find(s => s.track?.kind === 'video'); if (s && videoTrack) s.replaceTrack(videoTrack); });
    sendWs('SYSTEM', `${user?.nickname || user?.username} 停止了屏幕共享`);
  };

  // ---------- File Upload ----------
  const handleFileUpload = async (file: File): Promise<false> => {
    try {
      const result = await fileApi.upload(file);
      if (result?.url) {
        const fileInfo: SharedFile = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name,
          size: formatSize(file.size),
          url: result.url,
          uploadedBy: user?.nickname || user?.username || '匿名',
          uploadedById: user?.id,
          timestamp: dayjs().format('HH:mm'),
        };
        // 本地立即添加文件
        setSharedFiles(p => [...p, fileInfo]);
        // 再广播给其他人
        stompRef.current?.publish({ destination: `/app/meeting/${id}/file`, body: JSON.stringify(fileInfo) });
        message.success('文件已分享到会议');
      } else {
        message.error('上传返回无效地址');
      }
    } catch (err: any) {
      message.error(err.message || '上传失败');
    }
    return false;
  };

  const removeFile = (fileId: string) => {
    setSharedFiles(p => p.filter(f => f.id !== fileId));
    message.success('文件已移除');
  };

  const handleSend = () => {
    if (!chatInput.trim() || !hasJoined) return;
    sendWs('CHAT', chatInput);
    setChatInput('');
    // 重新聚焦输入框
    setTimeout(() => {
      const ta = document.querySelector('.meeting-chat-input textarea') as HTMLTextAreaElement;
      ta?.focus();
    }, 0);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  if (!meeting) return <Card style={{ borderRadius: 12, textAlign: 'center', padding: 48 }}>会议不存在</Card>;

  const uname = user?.nickname || user?.username || '我';

  return (
    <div ref={containerRef} style={{ height: 'calc(100vh - 88px)', display: 'flex', flexDirection: 'column', background: 'linear-gradient(145deg, #f0f8ff 0%, #e8f4fd 50%, #f0f8ff 100%)', borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'rgba(255,255,255,0.9)', borderBottom: '1px solid #d0e4f5', backdropFilter: 'blur(8px)' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/tech-meeting')} type="text" style={{ color: '#1677ff' }} />
          <div>
            <Text style={{ color: '#1a3a5c', fontWeight: 700, fontSize: 15 }}>{meeting.title}</Text>
            <Tag color={connected ? 'success' : 'default'} style={{ marginLeft: 8, fontSize: 10, borderRadius: 8 }}>
              {connected ? '已连接' : '未连接'}
            </Tag>
            {meeting.joinCode && (
              <Tag icon={<KeyOutlined />} color="blue" style={{ marginLeft: 4, fontSize: 10, borderRadius: 8, cursor: 'pointer' }}
                onClick={() => { navigator.clipboard.writeText(meeting.joinCode!); message.success('已复制加入码'); }}>
                加入码: {meeting.joinCode}
              </Tag>
            )}
          </div>
        </Space>
        <Space size={16}>
          <Text style={{ color: '#8899aa', fontSize: 12 }}><ClockCircleOutlined /> {dayjs().format('HH:mm')}</Text>
          {meeting.location && <Text style={{ color: '#8899aa', fontSize: 12 }}><EnvironmentOutlined /> {meeting.location}</Text>}
          <Badge count={participants.length} style={{ backgroundColor: '#1677ff' }}>
            <TeamOutlined style={{ color: '#1677ff', fontSize: 18 }} />
          </Badge>
        </Space>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 12, gap: 12 }}>
          {/* Video area */}
          <div style={{ flex: 1, display: 'flex', gap: 12, flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', background: 'rgba(22,119,255,0.04)', borderRadius: 12, padding: 16, border: '1px solid #d0e4f5' }}>
            <div style={{ position: 'relative', width: videoOn || screenSharing ? 320 : 200, height: videoOn || screenSharing ? 200 : 160, background: '#fff', borderRadius: 12, overflow: 'hidden', border: '2px solid #1677ff', boxShadow: '0 2px 12px rgba(22,119,255,0.15)' }}>
              <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', display: videoOn || screenSharing ? 'block' : 'none', transform: 'scaleX(-1)' }} />
              {!videoOn && !screenSharing && (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: '#b0c4de' }}><UserOutlined /></div>
              )}
              <div style={{ position: 'absolute', bottom: 4, left: 8, fontSize: 11, color: '#fff', background: 'rgba(22,119,255,0.7)', padding: '2px 8px', borderRadius: 6 }}>{uname} {screenSharing ? '(共享中)' : ''}</div>
            </div>
            {remoteStreams.map(rs => (
              <div key={rs.userId} style={{ width: 320, height: 200, background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #d0e4f5' }}>
                <video autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} ref={el => { if (el) el.srcObject = rs.stream; }} />
                <div style={{ position: 'relative', marginTop: -24, marginLeft: 8, fontSize: 11, color: '#fff', background: 'rgba(22,119,255,0.7)', padding: '2px 8px', borderRadius: 6, width: 'fit-content' }}>用户 {rs.userId}</div>
              </div>
            ))}
            {!videoOn && remoteStreams.length === 0 && (
              <div style={{ textAlign: 'center', color: '#8899aa' }}>
                <VideoCameraOutlined style={{ fontSize: 48, display: 'block', marginBottom: 8, color: '#b0c4de' }} />
                <Text style={{ color: '#8899aa' }}>点击"开启摄像头"开始视频通话</Text>
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '4px 0' }}>
            <Tooltip title={audioOn ? '关闭麦克风' : '开启麦克风'}>
              <Button shape="circle" size="large" icon={audioOn ? <AudioOutlined /> : <AudioMutedOutlined />}
                onClick={toggleAudio}
                style={{ background: audioOn ? '#1677ff' : '#d0e4f5', color: audioOn ? '#fff' : '#667788', border: 'none', width: 48, height: 48 }} />
            </Tooltip>
            <Tooltip title={videoOn ? '关闭摄像头' : '开启摄像头'}>
              <Button shape="circle" size="large" icon={<VideoCameraAddOutlined />}
                onClick={toggleVideo}
                style={{ background: videoOn ? '#1677ff' : '#d0e4f5', color: videoOn ? '#fff' : '#667788', border: 'none', width: 48, height: 48 }} />
            </Tooltip>
            <Tooltip title={screenSharing ? '停止共享' : '共享屏幕'}>
              <Button shape="circle" size="large" icon={<MonitorOutlined />}
                onClick={screenSharing ? stopScreenShare : startScreenShare}
                style={{ background: screenSharing ? '#52c41a' : '#d0e4f5', color: screenSharing ? '#fff' : '#667788', border: 'none', width: 48, height: 48 }} />
            </Tooltip>
            <Upload beforeUpload={handleFileUpload} showUploadList={false} accept="*">
              <Tooltip title="分享文件">
                <Button shape="circle" size="large" icon={<PaperClipOutlined />}
                  style={{ background: '#d0e4f5', color: '#667788', border: 'none', width: 48, height: 48 }} />
              </Tooltip>
            </Upload>
            {meeting && meeting.hostId === user?.id ? (
              <Tooltip title="结束会议">
                <Button shape="circle" size="large" icon={<StopOutlined />} danger
                  onClick={handleEndMeeting} style={{ width: 48, height: 48 }} />
              </Tooltip>
            ) : (
              <Tooltip title="离开会议">
                <Button shape="circle" size="large" icon={<StopOutlined />}
                  onClick={handleLeave} style={{ width: 48, height: 48, background: '#d0e4f5', color: '#667788', border: 'none' }} />
              </Tooltip>
            )}
          </div>
        </div>

        {/* Right Panel - chat/files */}
        <div style={{
          width: isMobile ? '100%' : 320,
          maxHeight: isMobile ? 240 : 'none',
          background: 'rgba(255,255,255,0.9)',
          borderLeft: isMobile ? 'none' : '1px solid #d0e4f5',
          borderTop: isMobile ? '1px solid #d0e4f5' : 'none',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #d0e4f5' }}>
            <Button type="text" onClick={() => setShowFilePanel(false)}
              style={{ flex: 1, color: !showFilePanel ? '#1677ff' : '#8899aa', borderBottom: !showFilePanel ? '2px solid #1677ff' : 'none', borderRadius: 0, fontWeight: !showFilePanel ? 600 : 400 }}>
              聊天
            </Button>
            <Button type="text" onClick={() => setShowFilePanel(true)}
              style={{ flex: 1, color: showFilePanel ? '#1677ff' : '#8899aa', borderBottom: showFilePanel ? '2px solid #1677ff' : 'none', borderRadius: 0, fontWeight: showFilePanel ? 600 : 400 }}>
              文件 ({sharedFiles.length})
            </Button>
          </div>

          {/* Chat */}
          {!showFilePanel && (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                {chatMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#b0c4de' }}>暂无消息</div>
                ) : (
                  chatMessages.map(m => (
                    <div key={m.id} style={{
                      marginBottom: 6, padding: '6px 10px', borderRadius: 8, fontSize: 13,
                      background: m.type === 'CHAT' ? '#f5f9ff' : m.type === 'SYSTEM' ? '#e6f0ff' : '#e6fff0',
                      color: m.type === 'CHAT' ? '#2c3e50' : '#667788',
                    }}>
                      {m.type === 'CHAT' ? (
                        <><Text style={{ color: '#1677ff', fontSize: 12, fontWeight: 600 }}>{m.sender}</Text><Text style={{ color: '#2c3e50', marginLeft: 4 }}>{m.content}</Text></>
                      ) : (
                        <Text style={{ fontSize: 12 }}>{m.content}</Text>
                      )}
                      <div style={{ fontSize: 10, color: '#b0c4de', textAlign: 'right' }}>{m.timestamp}</div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="meeting-chat-input" style={{ padding: 12, borderTop: '1px solid #d0e4f5', display: 'flex', gap: 8 }}>
                <TextArea value={chatInput} onChange={e => setChatInput(e.target.value)}
                  placeholder={hasJoined ? '输入消息...' : '加入后参与聊天'}
                  rows={2} style={{ borderRadius: 8, background: '#f5f9ff', border: '1px solid #d0e4f5', color: '#2c3e50', fontSize: 13 }}
                  onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  disabled={!hasJoined} />
                <Button type="primary" icon={<SendOutlined />} onClick={handleSend}
                  disabled={!hasJoined || !chatInput.trim()} style={{ borderRadius: 8, height: 52 }} />
              </div>
            </>
          )}

          {/* Files */}
          {showFilePanel && (
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              {sharedFiles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#b0c4de' }}>
                  <FileTextOutlined style={{ fontSize: 36, display: 'block', marginBottom: 8 }} />
                  暂无共享文件
                  <br />
                  <Upload beforeUpload={handleFileUpload} showUploadList={false} accept="*">
                    <Button type="dashed" icon={<PaperClipOutlined />} style={{ marginTop: 12, borderRadius: 8 }}>上传文件</Button>
                  </Upload>
                </div>
              ) : (
                sharedFiles.map(f => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginBottom: 8, background: '#f5f9ff', borderRadius: 8, border: '1px solid #e6f0ff' }}>
                    {getFileIcon(f.name)}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ color: '#2c3e50', fontSize: 13, display: 'block' }} ellipsis>{f.name}</Text>
                      <Text style={{ color: '#8899aa', fontSize: 11 }}>{f.size} · {f.uploadedBy}</Text>
                    </div>
                    <Space>
                      <a href={f.url} target="_blank" rel="noreferrer" style={{ color: '#1677ff' }}><DownloadOutlined /></a>
                      {f.uploadedById === user?.id && (
                        <Popconfirm title="确定移除？" onConfirm={() => removeFile(f.id)} okText="确定" cancelText="取消">
                          <Button type="text" size="small" danger icon={<DeleteOutlined />} style={{ fontSize: 14 }} />
                        </Popconfirm>
                      )}
                    </Space>
                  </div>
                ))
              )}
              {sharedFiles.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <Upload beforeUpload={handleFileUpload} showUploadList={false} accept="*">
                    <Button type="dashed" icon={<PaperClipOutlined />} size="small" style={{ borderRadius: 8 }}>上传文件</Button>
                  </Upload>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Join overlay */}
      {!hasJoined && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(22,119,255,0.15)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <Card style={{ textAlign: 'center', padding: '32px', borderRadius: 16, maxWidth: 420, boxShadow: '0 20px 60px rgba(22,119,255,0.2)' }}>
            <VideoCameraOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
            <Title level={4} style={{ margin: 0, color: '#1a3a5c' }}>{meeting.title}</Title>
            <Text type="secondary" style={{ display: 'block', margin: '8px 0 4px' }}>
              {dayjs(meeting.startTime).format('YYYY-MM-DD HH:mm')}
              {meeting.endTime && ` ~ ${dayjs(meeting.endTime).format('HH:mm')}`}
            </Text>
            <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
              {meeting.participantCount}/{meeting.maxParticipants || '∞'} 人 · {meeting.location || '线上'}
            </Text>
            {meeting.description && (
              <Text style={{ display: 'block', marginBottom: 16, color: '#667788', fontSize: 13 }}>{meeting.description}</Text>
            )}
            <Button type="primary" size="large" onClick={handleJoin} loading={joining} block
              style={{ height: 46, borderRadius: 10, fontWeight: 600 }}>
              加入会议
            </Button>
            <Button size="large" onClick={() => navigate('/tech-meeting')} block
              style={{ marginTop: 8, borderRadius: 10, height: 46 }}>
              返回
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MeetingRoom;
