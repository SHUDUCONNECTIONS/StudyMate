
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, MessageSquare, User as UserIcon, LogOut, PhoneCall, 
  Menu, ShieldCheck, BookOpen, Gamepad2, Shield
} from 'lucide-react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import bcrypt from 'bcryptjs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Types
import { User, Booking, Notification, Message, UserRole, PopiaData } from './types';

// Components
import { YandasmLogo } from './components/YandasmLogo';
import { LoadingScreen } from './components/LoadingScreen';
import { SidebarItem } from './components/SidebarItem';
import { NotificationCenter } from './components/NotificationCenter';

// Games
import { ZenSlasher } from './components/games/ZenSlasher';
import { ZipQuest } from './components/games/ZipQuest';
import { WordChallenge } from './components/games/WordChallenge';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { GameHubPage } from './pages/GameHubPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';
import { ChatPage } from './pages/ChatPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { ResourcesPage } from './pages/ResourcesPage';

// Services
const socket = io('https://yandastudymate-server.onrender.com', {
  transports: ['websocket'],
  reconnection: true
});

const API_KEY = process.env.GEMINI_API_KEY;

async function generateWellnessResponse(history: Message[]) {
  try {
    const response = await fetch('/api/chat', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ history })
    });
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I'm having trouble connecting to my creative center. Let's talk about something else or try again in a moment.";
  }
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeSession, setActiveSession] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentView = useMemo(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/') return 'Dashboard';
    if (path === '/chat') return 'Chat';
    if (path === '/admin') return 'AdminControl';
    if (path === '/profile') return 'Profile';
    if (path === '/emergency') return 'Emergency';
    if (path === '/resources') return 'Resources';
    if (path === '/games') return 'Game';
    return 'Dashboard';
  }, [location.pathname]);

  // --- SOCKETS ---
  useEffect(() => {
    socket.on('new_message', ({ bookingId, message }) => {
      if (activeSession && activeSession.id === bookingId) {
        setMessages(prev => {
          if (prev.find(m => m.id === message.id)) return prev;
          const newList = [...prev, message];
          // Persistence: Save to local storage
          const chatKey = `sm_chat_${bookingId}`;
          localStorage.setItem(chatKey, JSON.stringify(newList));
          return newList;
        });
      }
    });

    socket.on('bookings_changed', (updatedBookings: Booking[]) => {
      setBookings(updatedBookings);
    });

    socket.on('users_changed', (updatedUsers: User[]) => {
      setUsers(updatedUsers);
    });

    socket.on('new_notification', ({ userId, notification }) => {
      if (currentUser && currentUser.id === userId) {
        setNotifications(prev => {
          if (prev.find(n => n.id === notification.id)) return prev;
          return [notification, ...prev];
        });
      }
    });

    return () => {
      socket.off('new_message');
      socket.off('bookings_changed');
      socket.off('users_changed');
      socket.off('new_notification');
    };
  }, [activeSession, currentUser]);

  useEffect(() => {
    if (activeSession) {
      socket.emit('join_session', activeSession.id);
    }
  }, [activeSession]);

  // --- PERSISTENCE ---
  useEffect(() => {
    const savedUsers = localStorage.getItem('sm_users');
    const savedBookings = localStorage.getItem('sm_bookings');
    
    // Initial users (empty to start fresh)
    const defaultUsers: User[] = [];

    if (!savedUsers) {
      setUsers(defaultUsers);
      localStorage.setItem('sm_users', JSON.stringify(defaultUsers));
    } else {
      let parsed: User[] = JSON.parse(savedUsers).map((u: User) => {
        // Migration: Update old avataaars avatars to new notionists style
        if (u.avatar.includes('avataaars')) {
          const seed = u.avatarSeed || u.name;
          return { ...u, avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf` };
        }
        return u;
      });
      
      // Ensure all default users (admins and counsellors) exist in the list
      defaultUsers.forEach(defaultUser => {
        if (!parsed.find(u => u.email === defaultUser.email)) {
          parsed.push(defaultUser);
        }
      });
      
      setUsers(parsed);
    }

    if (savedBookings) setBookings(JSON.parse(savedBookings));

    const savedNotifs = localStorage.getItem('sm_notifications');
    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs).map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) })));
    }
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('sm_users', JSON.stringify(users));
      socket.emit('user_update', users);
    }
  }, [users]);

  useEffect(() => {
    localStorage.setItem('sm_bookings', JSON.stringify(bookings));
    socket.emit('booking_update', bookings);
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('sm_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  // --- ACTIONS ---
  const addNotification = (userId: string, title: string, message: string, type: 'booking' | 'registration' | 'info') => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      title,
      message,
      type,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    socket.emit('notification', { userId, notification: newNotif });
  };

  const markAllAsRead = (userId: string) => {
    setNotifications(notifications.map(n => n.userId === userId ? { ...n, read: true } : n));
  };

  const downloadPopiaPDF = (student: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(26, 26, 26); // Brand dark
    doc.text('POPIA COMPLIANCE DECLARATION', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('YandaStudyMate (Counselling & Wellness)', 105, 28, { align: 'center' });
    doc.line(20, 35, 190, 35);
    
    // Section 1: Learner Details
    doc.setFontSize(12);
    doc.text('1. LEARNER INFORMATION', 20, 45);
    doc.setFontSize(10);
    
    const learnerData = [
      ['Full Name', student.name],
      ['Identity/DOB', student.id_or_dob || 'N/A'],
      ['School', student.department || 'N/A'],
      ['Grade', `Grade ${student.year}`],
      ['Email', student.email],
    ];
    
    autoTable(doc, {
      startY: 50,
      head: [['Field', 'Value']],
      body: learnerData,
      theme: 'striped',
      headStyles: { fillColor: [91, 137, 189] } as any // Brand blue
    });
    
    // Section 2: Guardian Details
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.text('2. PARENT / GUARDIAN AUTHORIZATION', 20, finalY + 15);
    
    const guardianData = [
      ['Guardian Name', student.guardianName || 'N/A'],
      ['Relationship', student.guardianRelationship || 'N/A'],
      ['Contact Number', student.guardianContact || 'N/A'],
      ['Guardian Email', student.guardianEmail || 'N/A']
    ];
    
    autoTable(doc, {
      startY: finalY + 20,
      head: [['Field', 'Value']],
      body: guardianData,
      theme: 'striped',
      headStyles: { fillColor: [47, 179, 166] } as any // Brand teal
    });
    
    // Section 3: Declaration & Signature
    const finalY2 = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.text('3. DECLARATION OF CONSENT', 20, finalY2 + 15);
    doc.setFontSize(9);
    const declarationText = "I, the undersigned guardian, hereby grant permission for the minor to participate in the YandaStudyMate Counselling & Wellness ecosystem. I understand that personal data will be processed in accordance with POPIA regulations.";
    const splitText = doc.splitTextToSize(declarationText, 170);
    doc.text(splitText, 20, finalY2 + 22);
    
    doc.text(`Consent Verified: ${student.popiaConsent ? 'YES' : 'NO'}`, 20, finalY2 + 35);
    doc.text(`Signing Date: ${student.popiaDate}`, 20, finalY2 + 40);
    doc.text(`Location: ${student.popiaLocation}`, 20, finalY2 + 45);
    
    if (student.popiaSignature) {
      doc.text('Digital Signature:', 20, finalY2 + 55);
      doc.addImage(student.popiaSignature, 'PNG', 20, finalY2 + 60, 50, 25);
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by YandaStudyMate Compliance System', 105, 285, { align: 'center' });
    doc.text(`Timestamp: ${new Date().toLocaleString()}`, 105, 290, { align: 'center' });
    
    doc.save(`POPIA_${student.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handleRegister = async (
    name: string, 
    email: string, 
    password: string, 
    role: UserRole, 
    specialty?: string, 
    department?: string, 
    year?: number, 
    qualifications?: string, 
    gender?: any, 
    avatarSeed?: string, 
    cvFileName?: string, 
    profilePhoto?: string,
    popiaData?: PopiaData
  ) => {
    if (users.some(u => u.email === email)) {
      return 'Email already in use. Please sign in instead.';
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password: hashedPassword,
      role,
      avatar: profilePhoto || `https://api.dicebear.com/7.x/notionists/svg?seed=${avatarSeed || name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
      avatarSeed: avatarSeed || name,
      gender,
      status: role === 'counsellor' ? 'pending' : undefined,
      specialty,
      department,
      year,
      qualifications,
      cvFileName,
      profilePhoto,
      ...popiaData,
      popiaConsent: role === 'admin' ? true : popiaData?.popiaConsent
    } as User;
    setUsers([...users, newUser]);
    setCurrentUser(newUser);

    if (role === 'counsellor') {
      // Notify admins
      users.filter(u => u.role === 'admin').forEach(admin => {
        addNotification(admin.id, 'New registration', `${name} is awaiting approval.`, 'registration');
      });
    }
    return null;
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
  };

  const handleUpdateAvailability = (slots: string[]) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, availableSlots: slots };
    handleUpdateProfile(updatedUser);
  };

  const handleLogin = async (email: string, password: string) => {
    const user = users.find(u => u.email === email);
    if (user) {
      if (user.password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return 'Incorrect password. Please try again.';
      } else {
        // Handle migration if user has no password yet
        return 'Account recovery needed (no password set).';
      }
      setCurrentUser(user);
      return null;
    }
    return 'User not found. Please register to continue.';
  };

  const handleApprove = (id: string, approve: boolean) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: approve ? 'approved' : 'disapproved' } as User : u));
    
    const user = users.find(u => u.id === id);
    if (user) {
      addNotification(
        id, 
        approve ? 'Account Approved' : 'Application Status', 
        approve ? 'Your counsellor profile has been verified. You can now set your availability.' : 'Your application was not approved at this time.', 
        'info'
      );
    }
  };

  const handleBook = (counsellorId: string, time: string, isAnon: boolean) => {
    if (!currentUser) return;
    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      learnerId: currentUser.id,
      counsellorId,
      time,
      status: 'upcoming',
      anonymous: isAnon
    };
    setBookings([...bookings, newBooking]);

    // Notify counsellor
    addNotification(
      counsellorId, 
      'New Session Booked', 
      `A session for ${time} has been booked. ${isAnon ? 'Anonymous entry.' : `Student: ${currentUser.name}`}`, 
      'booking'
    );
    
    // Remove slot from counsellor's available list
    setUsers(users.map(u => {
      if (u.id === counsellorId && u.availableSlots) {
        return { ...u, availableSlots: u.availableSlots.filter(s => s !== time) };
      }
      return u;
    }));
  };

  const handleCancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));

    // Notify both parties
    const learner = users.find(u => u.id === booking.learnerId);
    const counsellor = users.find(u => u.id === booking.counsellorId);

    if (learner && counsellor) {
      if (currentUser?.id === learner.id) {
        addNotification(counsellor.id, 'Session Cancelled', `The session on ${booking.time} has been cancelled by the student.`, 'booking');
      } else {
        addNotification(learner.id, 'Session Cancelled', `Your session on ${booking.time} has been cancelled by the counsellor.`, 'booking');
      }
    }

    // Add slot back to counsellor if not instant
    if (booking.time !== 'Now') {
      setUsers(prev => prev.map(u => {
        if (u.id === booking.counsellorId) {
          const currentSlots = u.availableSlots || [];
          if (!currentSlots.includes(booking.time)) {
            return { ...u, availableSlots: [...currentSlots, booking.time].sort() };
          }
        }
        return u;
      }));
    }
  };

  const handleUpdateBooking = (bookingId: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updates } : b));
  };

  const submitRating = (bookingId: string, rating: number) => {
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, rating, status: 'completed' } : b));
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setUsers(users.map(u => {
        if (u.id === booking.counsellorId) {
          const oldCount = u.reviewCount || 0;
          const oldRating = u.rating || 0;
          const newRating = ((oldRating * oldCount) + rating) / (oldCount + 1);
          return { ...u, rating: newRating, reviewCount: oldCount + 1 };
        }
        return u;
      }));
    }
    setActiveSession(null);
    navigate('/dashboard');
  };

  const handleToggleTrust = (counsellorId: string) => {
    if (!currentUser) return;
    
    const isTrusted = currentUser.trustedCounsellors?.includes(counsellorId);
    let updatedTrusted = [...(currentUser.trustedCounsellors || [])];
    
    if (isTrusted) {
      updatedTrusted = updatedTrusted.filter(id => id !== counsellorId);
    } else {
      updatedTrusted.push(counsellorId);
    }
    
    const updatedUser = { ...currentUser, trustedCounsellors: updatedTrusted };
    setCurrentUser(updatedUser);
    
    // Update users list too
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    
    if (isTrusted) {
       addNotification(currentUser.id, 'Counsellor Removed', 'You have removed this counsellor from your trusted list.', 'info');
    } else {
       addNotification(currentUser.id, 'Counsellor Trusted', 'You can now start direct chats with this counsellor at any time.', 'info');
    }
  };

  const startDirectChat = (counsellorId: string) => {
    if (!currentUser) return;
    const existing = bookings.find(b => b.learnerId === currentUser.id && b.counsellorId === counsellorId && b.time === 'Most Trusted Chat' && b.status === 'upcoming');
    
    if (existing) {
      setActiveSession(existing);
      navigate('/chat');
    } else {
      const newBooking: Booking = {
        id: `direct_${Math.random().toString(36).substr(2, 9)}`,
        learnerId: currentUser.id,
        counsellorId,
        time: 'Most Trusted Chat',
        status: 'upcoming',
        anonymous: false
      };
      setBookings([...bookings, newBooking]);
      setActiveSession(newBooking);
      navigate('/chat');
      
      addNotification(counsellorId, 'Direct Chat Started', `${currentUser.name} (Member who trusts you) has started a direct chat.`, 'booking');
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || isLoading || !currentUser) return;
    const userMsg: Message = { 
      role: 'user', 
      content: chatInput, 
      id: Math.random().toString(36).substr(2, 9), 
      timestamp: Date.now(),
      senderId: currentUser.id
    };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    
    if (activeSession) {
      socket.emit('send_message', { bookingId: activeSession.id, message: userMsg });
      // Persistence: Save to local storage
      const chatKey = `sm_chat_${activeSession.id}`;
      const saved = localStorage.getItem(chatKey);
      const chatHistory = saved ? JSON.parse(saved) : [];
      localStorage.setItem(chatKey, JSON.stringify([...chatHistory, userMsg]));
    }

    if (!activeSession) {
      // Wellness Chat with AI
      setIsLoading(true);
      try {
        const response = await generateWellnessResponse([...messages, userMsg]);
        const assistantMsg: Message = { role: 'assistant', content: response || "...", id: Math.random().toString(36), timestamp: Date.now() };
        setMessages(prev => [...prev, assistantMsg]);
      } catch {
        setMessages(prev => [...prev, { role: 'system', content: "Connection lost. Please try again.", id: 'err', timestamp: Date.now() }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // --- VIEWS ---
  if (isLoading && !currentUser) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage onGetStarted={() => navigate('/auth')} />} />
        <Route path="/auth" element={<AuthPage onLogin={handleLogin} onRegister={handleRegister} onBack={() => navigate('/')} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (currentUser && currentUser.role !== 'admin' && !currentUser.popiaConsent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg yandasm-card bg-white p-12 text-center shadow-2xl border-4 border-brand-lavender/30">
           <div className="w-24 h-24 bg-brand-lavender/10 text-brand-lavender rounded-full flex items-center justify-center mx-auto mb-8">
              <Shield size={48} />
           </div>
           <h2 className="text-3xl font-display font-black text-brand-dark uppercase tracking-tighter mb-4 italic">POPIA Consent Required</h2>
           <p className="text-slate-500 font-bold mb-8 leading-relaxed">
             To protect your privacy and comply with POPIA regulations, we require all users to complete the digital consent and declaration form.
           </p>
           <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 mb-8 text-left">
              <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Compliance Requirement</h4>
              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                South African law requires clear authorization for collecting and storing personal wellness data. Minors must have guardian consent, while adults may self-authorize.
              </p>
           </div>
           <button 
             onClick={() => setCurrentUser(null)}
             className="btn-primary w-full py-5 text-sm uppercase tracking-widest"
           >
             Log Out & Contact Support
           </button>
           <p className="mt-8 text-[9px] font-black uppercase text-slate-300 tracking-[0.3em]">YandaStudyMate Compliance Engine</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FFF9F2] text-[#1A1A1A] font-sans selection:bg-brand-yellow/50 overflow-hidden">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={{ 
          x: (isSidebarOpen || !isMobile) ? 0 : -320
        }}
        className="fixed top-0 bottom-0 left-0 w-80 bg-brand-dark flex flex-col overflow-hidden shrink-0 z-[110] border-r-4 border-black lg:static lg:translate-x-0"
      >
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white rounded-2xl border-2 border-black rotate-[-3deg] shadow-[4px_4px_0px_0px_#FFD23F]">
              <YandasmLogo className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-xl font-display font-black text-white tracking-tighter uppercase leading-none">Yandasm</h1>
              <p className="text-[9px] font-black text-brand-yellow uppercase tracking-[0.1em] mt-1">Counselling & Wellness</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-3 overflow-y-auto no-scrollbar">
          <SidebarItem icon={Home} label="Dashboard" active={currentView === 'Dashboard'} onClick={() => { navigate('/dashboard'); setIsSidebarOpen(false); }} activeColor="bg-brand-blue" />
          {currentUser.role === 'learner' && <SidebarItem icon={MessageSquare} label="Wellness Chat" active={currentView === 'Chat'} onClick={() => { setMessages([]); setActiveSession(null); navigate('/chat'); setIsSidebarOpen(false); }} activeColor="bg-brand-pink" />}
          <SidebarItem icon={Gamepad2} label="Mental Games" active={currentView === 'Game'} onClick={() => { navigate('/games'); setIsSidebarOpen(false); }} activeColor="bg-brand-yellow" />
          <SidebarItem icon={UserIcon} label="My Profile" active={currentView === 'Profile'} onClick={() => { navigate('/profile'); setIsSidebarOpen(false); }} activeColor="bg-brand-orange" />
          {currentUser.role === 'admin' && <SidebarItem icon={ShieldCheck} label="Admin Panel" active={currentView === 'AdminControl'} onClick={() => { navigate('/admin'); setIsSidebarOpen(false); }} activeColor="bg-brand-teal" />}
          <SidebarItem icon={BookOpen} label="Library" active={currentView === 'Resources'} onClick={() => { navigate('/resources'); setIsSidebarOpen(false); }} activeColor="bg-brand-lavender" />
          <SidebarItem icon={PhoneCall} label="Emergency" active={currentView === 'Emergency'} onClick={() => { navigate('/emergency'); setIsSidebarOpen(false); }} activeColor="bg-red-500" />
        </nav>

        <div className="p-6 border-t-2 border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <img src={currentUser.avatar} className="w-12 h-12 rounded-2xl border-2 border-brand-yellow shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-black rounded-full" />
            </div>
            <div className="min-w-0">
              <p className="font-display font-black text-sm text-white truncate uppercase tracking-tighter">{currentUser.name}</p>
              <p className="text-[10px] font-black text-brand-yellow/80 truncate uppercase tracking-widest leading-none mt-1">
                {currentUser.role}
              </p>
            </div>
          </div>
          <button onClick={() => setCurrentUser(null)} className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-red-500/20 text-white rounded-xl border border-white/20 transition-all font-black uppercase text-[10px] tracking-widest">
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </motion.aside>

      <div className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300`}>
        <header className="h-16 lg:h-24 flex items-center justify-between px-4 lg:px-10 bg-white border-b-2 border-black shrink-0 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2.5 bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] hover:bg-slate-50 transition-all active:translate-x-0.5 active:translate-y-0.5 lg:hidden"
              aria-label="Toggle Navigation"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <span className="hidden md:inline text-[7px] font-black uppercase text-slate-400 tracking-[0.3em] mb-1">Navigation</span>
              <h2 className="font-display font-black text-brand-dark uppercase tracking-widest text-[10px] lg:text-xs px-3 lg:px-5 py-1.5 bg-brand-yellow rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_#000]">{currentView}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3 lg:gap-4">
             <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[9px] font-black uppercase text-slate-400">Wellness Goal</span>
                <div className="w-24 lg:w-32 h-1.5 bg-slate-100 rounded-full border border-black/5 mt-1 overflow-hidden">
                   <div className="w-3/4 h-full bg-brand-teal" />
                </div>
             </div>
             <div className="p-1 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000]">
                <NotificationCenter notifications={notifications} userId={currentUser.id} onMarkRead={markAllAsRead} />
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 no-scrollbar bg-[#FFF9F2]/30 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage user={currentUser} users={users} bookings={bookings} onJoinSess={(b: any) => { setActiveSession(b); navigate('/chat'); }} onBook={handleBook} onUpdateAvailability={handleUpdateAvailability} onCancelBooking={handleCancelBooking} onUpdateBooking={handleUpdateBooking} notifications={notifications} setNotifications={setNotifications} onToggleTrust={handleToggleTrust} onStartDirectChat={startDirectChat} />} />
                <Route path="/admin" element={<AdminPage users={users} onApprove={handleApprove} bookings={bookings} messages={messages} onDownloadPDF={downloadPopiaPDF} />} />
                <Route path="/profile" element={<ProfilePage user={currentUser} onUpdate={handleUpdateProfile} onLogout={() => setCurrentUser(null)} />} />
                <Route path="/chat" element={<ChatPage user={currentUser} users={users} messages={messages} setMessages={setMessages} chatInput={chatInput} setChatInput={setChatInput} onSend={handleSendChat} isLoading={isLoading} session={activeSession} onFinish={(id: string, rating: number) => submitRating(id, rating)} scrollRef={scrollRef} onUpdateUser={handleUpdateProfile} />} />
                <Route path="/emergency" element={<EmergencyPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/games" element={<GameHubPage onSelect={(g) => { setActiveGame(g); setShowGame(true); }} />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {showGame && (
        <div className="fixed inset-0 z-[120]">
          {!activeGame && (
            <div className="w-full h-full bg-brand-dark/95 backdrop-blur-md flex items-center justify-center p-4">
              <div className="max-w-4xl w-full">
                <div className="flex justify-between items-center mb-8 px-4">
                  <h2 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter">Choose Your Focus</h2>
                  <button onClick={() => setShowGame(false)} className="p-4 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] font-black uppercase text-xs">Close</button>
                </div>
                <GameHubPage onSelect={(g) => setActiveGame(g)} />
              </div>
            </div>
          )}
          {activeGame === 'zen' && <ZenSlasher onClose={() => { setActiveGame(null); setShowGame(false); }} />}
          {activeGame === 'zip' && <ZipQuest onClose={() => { setActiveGame(null); setShowGame(false); }} />}
          {activeGame === 'word' && <WordChallenge onClose={() => { setActiveGame(null); setShowGame(false); }} />}
        </div>
      )}

      {/* Floating Game Entry */}
      <AnimatePresence>
        {currentView !== 'Game' && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-40 group"
          >
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowGame(true)}
              className="w-16 h-16 bg-brand-yellow border-4 border-black rounded-[24px] shadow-[6px_6px_0px_0px_#000] flex items-center justify-center text-brand-dark relative"
            >
              <Gamepad2 size={28} />
              <div className="absolute -top-12 right-0 bg-black text-white px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
                Mental Break?
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
