
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, MessageSquare, User as UserIcon, LogOut, PhoneCall,
  Menu, ShieldCheck, BookOpen, Gamepad2, Shield, Calendar
} from 'lucide-react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Firebase
import { auth, db } from './lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection, doc, setDoc, getDoc, getDocs, updateDoc, addDoc,
  onSnapshot, query, where, orderBy, writeBatch, serverTimestamp,
} from 'firebase/firestore';

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
import { SessionsPage } from './pages/SessionsPage';
import { GameHubPage } from './pages/GameHubPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';
import { ChatPage } from './pages/ChatPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { ResourcesPage } from './pages/ResourcesPage';


function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
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
  const [zenLeaderboard,  setZenLeaderboard]  = useState<{ name: string; score: number }[]>([]);
  const [zipLeaderboard,  setZipLeaderboard]  = useState<{ name: string; score: number }[]>([]);
  const [wordLeaderboard, setWordLeaderboard] = useState<{ name: string; score: number }[]>([]);
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
    if (path === '/sessions') return 'Sessions';
    if (path === '/admin') return 'AdminControl';
    if (path === '/profile') return 'Profile';
    if (path === '/emergency') return 'Emergency';
    if (path === '/resources') return 'Resources';
    if (path === '/games') return 'Game';
    return 'Dashboard';
  }, [location.pathname]);

  // --- AUTH ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setCurrentUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // --- REAL-TIME DATA ---
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as User)));
    });
    return unsubscribe;
  }, [currentUser?.id]);

  // Scope bookings to what the current user is involved in
  useEffect(() => {
    if (!currentUser) return;
    const field = currentUser.role === 'counsellor' ? 'counsellorId' : currentUser.role === 'learner' ? 'learnerId' : null;
    const q = field
      ? query(collection(db, 'bookings'), where(field, '==', currentUser.id))
      : collection(db, 'bookings'); // admin sees all
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
    });
    return unsubscribe;
  }, [currentUser?.id, currentUser?.role]);

  // --- GLOBAL GAME LEADERBOARDS ---
  // Gated on currentUser so request.auth is non-null when Firestore evaluates rules
  useEffect(() => {
    if (!currentUser) return;
    const mkListener = (game: string, setter: (v: { name: string; score: number }[]) => void) =>
      onSnapshot(
        query(collection(db, 'scores'), where('game', '==', game), orderBy('score', 'desc')),
        snap => setter(snap.docs.map(d => ({ name: d.data().name as string, score: d.data().score as number }))),
        () => {} // ignore index-missing or other errors silently
      );
    const u1 = mkListener('zen',  setZenLeaderboard);
    const u2 = mkListener('zip',  setZipLeaderboard);
    const u3 = mkListener('word', setWordLeaderboard);
    return () => { u1(); u2(); u3(); };
  }, [currentUser?.id]);

  const prevUnreadRef     = useRef<number | null>(null);
  const audioCtxRef       = useRef<AudioContext | null>(null);
  const hasUserGestureRef = useRef(false);

  // Unlock AudioContext and vibration on the first user interaction
  useEffect(() => {
    const unlock = () => {
      hasUserGestureRef.current = true;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    };
    window.addEventListener('click',   unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
    return () => {
      window.removeEventListener('click',   unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'notifications'), where('userId', '==', currentUser.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(d => {
        const data = d.data();
        return {
          ...data,
          id: d.id,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
        } as Notification;
      });
      const sorted = notifs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      const unreadCount = sorted.filter(n => !n.read).length;

      // Play sound + vibrate only when genuinely new notifications arrive (not on initial load)
      if (prevUnreadRef.current !== null && unreadCount > prevUnreadRef.current) {
        playNotificationSound();
        if (hasUserGestureRef.current && 'vibrate' in navigator) navigator.vibrate([200, 80, 200, 80, 100]);
      }
      prevUnreadRef.current = unreadCount;
      setNotifications(sorted);
    });
    return unsubscribe;
  }, [currentUser?.id]);

  // --- APPOINTMENT REMINDERS & AUTO-MISSED ---
  // Parse "Monday 10:00" → nearest Date (this week's occurrence)
  const getAppointmentDate = (timeStr: string): Date | null => {
    const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const parts = timeStr.trim().split(' ');
    if (parts.length !== 2) return null;
    const dayIdx = DAYS.indexOf(parts[0]);
    if (dayIdx === -1) return null;
    const [h, m] = parts[1].split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    const now = new Date();
    const d = new Date(now);
    d.setDate(now.getDate() + (dayIdx - now.getDay()));
    d.setHours(h, m, 0, 0);
    return d;
  };

  useEffect(() => {
    if (!currentUser || bookings.length === 0) return;
    const check = () => {
      const now = new Date();
      bookings.filter(b => b.status === 'upcoming').forEach(b => {
        const appt = getAppointmentDate(b.time);
        if (!appt) return;
        const minsUntil = (appt.getTime() - now.getTime()) / 60000;
        // 15-minute reminder (only once per booking)
        if (minsUntil > 0 && minsUntil <= 15 && !b.reminderSent) {
          updateDoc(doc(db, 'bookings', b.id), { reminderSent: true });
          const learner = users.find(u => u.id === b.learnerId);
          const counsellor = users.find(u => u.id === b.counsellorId);
          addNotification(b.learnerId, 'Session in 15 minutes', `Your session with ${counsellor?.name || 'your counsellor'} starts soon. Get ready!`, 'booking');
          addNotification(b.counsellorId, 'Session in 15 minutes', `Your session with ${b.anonymous ? 'an anonymous learner' : (learner?.name || 'a learner')} starts soon.`, 'booking');
        }
        // Auto-missed: appointment ended more than 1 hour ago
        if (minsUntil < -60) {
          updateDoc(doc(db, 'bookings', b.id), { status: 'missed' });
          const learner = users.find(u => u.id === b.learnerId);
          const counsellor = users.find(u => u.id === b.counsellorId);
          addNotification(b.learnerId, 'Session Missed', `Your session with ${counsellor?.name || 'your counsellor'} was marked as missed.`, 'info');
          addNotification(b.counsellorId, 'Session Missed', `The session with ${b.anonymous ? 'an anonymous learner' : (learner?.name || 'a learner')} was auto-marked as missed.`, 'info');
        }
      });
    };
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [bookings, currentUser?.id]);

  // --- CHAT MESSAGES (real session) ---
  useEffect(() => {
    if (!activeSession) {
      setMessages([]);
      return;
    }
    const unsubscribe = onSnapshot(
      query(collection(db, 'chats', activeSession.id, 'messages'), orderBy('timestamp', 'asc')),
      (snapshot) => {
        setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
      },
      (error) => {
        console.error('Chat listener error:', error);
        setMessages([{
          role: 'system',
          content: 'Unable to load messages. Please check your connection or contact support.',
          id: 'listen-err',
          timestamp: Date.now(),
        }]);
      }
    );
    return unsubscribe;
  }, [activeSession?.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  // --- ACTIONS ---

  // Funky ascending-arpeggio notification sound using the Web Audio API
  // Uses the shared AudioContext created on first user gesture — avoids the
  // "AudioContext was not allowed to start" browser policy error.
  const playNotificationSound = () => {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx || !hasUserGestureRef.current) return;
      if (ctx.state === 'suspended') ctx.resume();
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.09;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc.start(t);
        osc.stop(t + 0.22);
      });
    } catch {}
  };

  // Write to Firestore `mail` collection — picked up by the
  // "Trigger Email from Firestore" Firebase Extension to send a real email.
  const sendEmailNotification = (toEmail: string, toName: string, subject: string, body: string) => {
    addDoc(collection(db, 'mail'), {
      to: toEmail,
      message: {
        subject: `Yandasm: ${subject}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:#1A1A1A;padding:20px 24px;border-radius:12px;margin-bottom:24px;">
              <h1 style="color:#FFD23F;margin:0;font-size:22px;letter-spacing:-0.5px;">YANDASM</h1>
              <p style="color:rgba(255,255,255,0.5);margin:4px 0 0;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;">Counselling & Wellness</p>
            </div>
            <h2 style="color:#1A1A1A;font-size:18px;margin-bottom:8px;">${subject}</h2>
            <p style="color:#555;font-size:14px;line-height:1.7;">Hi ${toName},</p>
            <p style="color:#555;font-size:14px;line-height:1.7;">${body}</p>
            <div style="background:#f4f4f4;border-radius:10px;padding:14px 16px;margin-top:24px;">
              <p style="color:#999;font-size:11px;margin:0;">Automated message from Yandasm. Log in to view or respond.</p>
            </div>
          </div>`,
      },
    }).catch(() => {}); // silent fail if extension not installed
  };

  const addNotification = async (userId: string, title: string, message: string, type: 'booking' | 'registration' | 'info' | 'report') => {
    await addDoc(collection(db, 'notifications'), {
      userId, title, message, type,
      timestamp: serverTimestamp(),
      read: false,
    });
    // Send email to the recipient
    const recipient = users.find(u => u.id === userId);
    if (recipient?.email) {
      sendEmailNotification(recipient.email, recipient.name, title, message);
    }
  };

  const markAllAsRead = async (userId: string) => {
    const batch = writeBatch(db);
    notifications
      .filter(n => n.userId === userId && !n.read)
      .forEach(n => batch.update(doc(db, 'notifications', n.id), { read: true }));
    await batch.commit();
  };

  const downloadPopiaPDF = (student: any) => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(26, 26, 26);
    doc.text('POPIA COMPLIANCE DECLARATION', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('YandaStudyMate (Counselling & Wellness)', 105, 28, { align: 'center' });
    doc.line(20, 35, 190, 35);

    doc.setFontSize(12);
    doc.text('1. LEARNER INFORMATION', 20, 45);
    doc.setFontSize(10);

    const learnerData = [
      ['Full Name', student.name],
      ['Identity/DOB', student.id_or_dob || 'N/A'],
      ...(student.isForeign ? [['Passport Number', student.passportNo || 'N/A']] : []),
      ['School', student.department || 'N/A'],
      ['Grade', `Grade ${student.year}`],
      ['Email', student.email],
    ];

    autoTable(doc, {
      startY: 50,
      head: [['Field', 'Value']],
      body: learnerData,
      theme: 'striped',
      headStyles: { fillColor: [91, 137, 189] } as any,
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.text('2. PARENT / GUARDIAN AUTHORIZATION', 20, finalY + 15);

    const guardianData = [
      ['Guardian Name', student.guardianName || 'N/A'],
      ['Relationship', student.guardianRelationship || 'N/A'],
      ['Contact Number', student.guardianContact || 'N/A'],
      ['Guardian Email', student.guardianEmail || 'N/A'],
      ...(student.isForeign ? [['Guardian Passport', student.guardianPassportNo || 'N/A']] : []),
    ];

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Field', 'Value']],
      body: guardianData,
      theme: 'striped',
      headStyles: { fillColor: [47, 179, 166] } as any,
    });

    const finalY2 = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.text('3. DECLARATION OF CONSENT', 20, finalY2 + 15);
    doc.setFontSize(9);
    const declarationText = "I, the undersigned guardian, hereby grant permission for the minor to participate in the YandaStudyMate Counselling & Wellness ecosystem. I understand that personal data will be processed in accordance with POPIA regulations.";
    doc.text(doc.splitTextToSize(declarationText, 170), 20, finalY2 + 22);
    doc.text(`Consent Verified: ${student.popiaConsent ? 'YES' : 'NO'}`, 20, finalY2 + 35);
    doc.text(`Signing Date: ${student.popiaDate}`, 20, finalY2 + 40);
    doc.text(`Location: ${student.popiaLocation}`, 20, finalY2 + 45);

    if (student.popiaSignature) {
      doc.text('Digital Signature:', 20, finalY2 + 55);
      doc.addImage(student.popiaSignature, 'PNG', 20, finalY2 + 60, 50, 25);
    }

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
    const buildUserDoc = (uid: string) => ({
      id: uid,
      name,
      email,
      role,
      avatar: profilePhoto || `https://api.dicebear.com/7.x/notionists/svg?seed=${avatarSeed || name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
      avatarSeed: avatarSeed || name,
      gender: gender || 'other',
      ...(role === 'counsellor' && { status: 'pending' as const }),
      ...(specialty && { specialty }),
      ...(department && { department }),
      ...(year !== undefined && { year }),
      ...(qualifications && { qualifications }),
      ...(cvFileName && { cvFileName }),
      ...(profilePhoto && { profilePhoto }),
      ...(popiaData && { ...popiaData }),
      popiaConsent: role === 'admin' ? true : (popiaData?.popiaConsent ?? false),
    });

    const finaliseUser = async (uid: string) => {
      const rawUser = buildUserDoc(uid);
      await setDoc(doc(db, 'users', uid), rawUser);
      setCurrentUser(rawUser as unknown as User);
      if (role === 'counsellor') {
        const adminSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'admin')));
        adminSnap.forEach(d =>
          addNotification(d.id, 'New registration', `${name} is awaiting approval.`, 'registration')
        );
      }
    };

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await finaliseUser(credential.user.uid);
      return null;
    } catch (error: any) {
      switch (error.code) {
        case 'auth/email-already-in-use': {
          // A previous failed registration may have created the Firebase Auth account
          // but never written the Firestore document (orphaned account).
          // Try signing in — if no Firestore doc exists, complete the registration.
          try {
            const existing = await signInWithEmailAndPassword(auth, email, password);
            const existingDoc = await getDoc(doc(db, 'users', existing.user.uid));
            if (!existingDoc.exists()) {
              await finaliseUser(existing.user.uid);
              return null;
            }
          } catch {
            // Wrong password or other sign-in error — genuine duplicate
          }
          return 'Email already in use. Please sign in instead.';
        }
        case 'auth/invalid-email':
          return 'Invalid email address format.';
        case 'auth/weak-password':
          return 'Password must be at least 6 characters.';
        case 'auth/operation-not-allowed':
          return 'Registration is currently unavailable. Please contact support.';
        case 'auth/too-many-requests':
          return 'Too many attempts. Please try again later.';
        default:
          return error.message || 'Registration failed.';
      }
    }
  };

  const handleUpdateProfile = async (updatedUser: User) => {
    const { id, ...data } = updatedUser;
    await updateDoc(doc(db, 'users', id), data as any);
    setCurrentUser(updatedUser);
  };

  const handleUpdateAvailability = (slots: string[]) => {
    if (!currentUser) return;
    // Never persist past slots — filter them out before saving
    const futureSlots = slots.filter(slot => {
      const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const parts = slot.trim().split(' ');
      if (parts.length !== 2) return false;
      const dayIdx = DAYS.indexOf(parts[0]);
      if (dayIdx === -1) return false;
      const [h, m] = parts[1].split(':').map(Number);
      if (isNaN(h) || isNaN(m)) return false;
      const now = new Date();
      const diff = now.getDay() === 0 ? -6 : 1 - now.getDay();
      const d = new Date(now);
      d.setDate(now.getDate() + diff + dayIdx);
      d.setHours(h, m, 0, 0);
      return d > now;
    });
    handleUpdateProfile({ ...currentUser, availableSlots: futureSlots });
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return null;
    } catch (error: any) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
          return 'No account found with these credentials. Please register.';
        case 'auth/wrong-password':
          return 'Incorrect password. Please try again.';
        case 'auth/invalid-email':
          return 'Invalid email address.';
        case 'auth/too-many-requests':
          return 'Too many failed attempts. Please try again later.';
        case 'auth/user-disabled':
          return 'This account has been disabled. Please contact support.';
        default:
          return error.message || 'Login failed.';
      }
    }
  };

  const handleAddCounsellor = async (name: string, email: string, password: string, specialty: string) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;
      const newUser: Omit<User, 'password'> = {
        id: uid,
        name,
        email,
        role: 'counsellor',
        status: 'approved',
        specialty,
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
        avatarSeed: name,
        popiaConsent: true,
      };
      await setDoc(doc(db, 'users', uid), newUser);
      return null;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') return 'Email already in use.';
      return error.message || 'Failed to create account.';
    }
  };

  const handleApprove = async (id: string, approve: boolean) => {
    await updateDoc(doc(db, 'users', id), { status: approve ? 'approved' : 'disapproved' });
    await addNotification(
      id,
      approve ? 'Account Approved' : 'Application Status',
      approve
        ? 'Your counsellor profile has been verified. You can now set your availability.'
        : 'Your application was not approved at this time.',
      'info'
    );
  };

  // Format "Monday 10:00" → "Monday 10:00 · 27 May" for use in notifications
  const formatBookingTime = (timeStr: string): string => {
    const appt = getAppointmentDate(timeStr);
    if (!appt) return timeStr;
    const day  = appt.toLocaleDateString('en-US', { weekday: 'long' });
    const time = appt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = `${appt.getDate()} ${appt.toLocaleDateString('en-US', { month: 'short' })}`;
    return `${day} ${time} · ${date}`;
  };

  const handleBook = async (counsellorId: string, time: string, isAnon: boolean) => {
    if (!currentUser) return;
    const bookingRef = doc(collection(db, 'bookings'));
    const newBooking: Booking = {
      id: bookingRef.id,
      learnerId: currentUser.id,
      counsellorId,
      time,
      status: 'upcoming',
      anonymous: isAnon,
    };
    await setDoc(bookingRef, newBooking);

    await addNotification(
      counsellorId,
      'New Session Booked',
      `A session for ${formatBookingTime(time)} has been booked. ${isAnon ? 'Anonymous entry.' : `Student: ${currentUser.name}`}`,
      'booking'
    );

    const counsellor = users.find(u => u.id === counsellorId);
    if (counsellor?.availableSlots) {
      await updateDoc(doc(db, 'users', counsellorId), {
        availableSlots: counsellor.availableSlots.filter(s => s !== time),
      });
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    await updateDoc(doc(db, 'bookings', bookingId), { status: 'cancelled' });

    const learner = users.find(u => u.id === booking.learnerId);
    const counsellor = users.find(u => u.id === booking.counsellorId);
    if (learner && counsellor) {
      if (currentUser?.id === learner.id) {
        await addNotification(counsellor.id, 'Session Cancelled', `The session on ${formatBookingTime(booking.time)} has been cancelled by the student.`, 'booking');
      } else {
        await addNotification(learner.id, 'Session Cancelled', `Your session on ${formatBookingTime(booking.time)} has been cancelled by the counsellor.`, 'booking');
      }
    }

    if (booking.time !== 'Now') {
      const currentSlots = counsellor?.availableSlots || [];
      if (!currentSlots.includes(booking.time)) {
        await updateDoc(doc(db, 'users', booking.counsellorId), {
          availableSlots: [...currentSlots, booking.time].sort(),
        });
      }
    }
  };

  const handleUpdateBooking = async (bookingId: string, updates: Partial<Booking>) => {
    await updateDoc(doc(db, 'bookings', bookingId), updates as any);
  };

  const submitRating = async (bookingId: string, rating: number) => {
    await updateDoc(doc(db, 'bookings', bookingId), { rating, status: 'completed' });
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      const counsellor = users.find(u => u.id === booking.counsellorId);
      if (counsellor) {
        const oldCount = counsellor.reviewCount || 0;
        const oldRating = counsellor.rating || 0;
        const newRating = ((oldRating * oldCount) + rating) / (oldCount + 1);
        await updateDoc(doc(db, 'users', booking.counsellorId), {
          rating: newRating,
          reviewCount: oldCount + 1,
        });
      }
    }
    setActiveSession(null);
    navigate('/dashboard');
  };

  const handleToggleTrust = async (counsellorId: string) => {
    if (!currentUser) return;

    const isTrusted = currentUser.trustedCounsellors?.includes(counsellorId);
    const updatedTrusted = isTrusted
      ? (currentUser.trustedCounsellors || []).filter(id => id !== counsellorId)
      : [...(currentUser.trustedCounsellors || []), counsellorId];

    await updateDoc(doc(db, 'users', currentUser.id), { trustedCounsellors: updatedTrusted });
    setCurrentUser({ ...currentUser, trustedCounsellors: updatedTrusted });

    await addNotification(
      currentUser.id,
      isTrusted ? 'Counsellor Removed' : 'Counsellor Trusted',
      isTrusted
        ? 'You have removed this counsellor from your trusted list.'
        : 'You can now start direct chats with this counsellor at any time.',
      'info'
    );
  };

  const startDirectChat = async (otherUserId: string) => {
    if (!currentUser) return;
    // Resolve correct learnerId/counsellorId regardless of which role calls this
    const learnerId  = currentUser.role === 'learner' ? currentUser.id : otherUserId;
    const counsellorId = currentUser.role === 'learner' ? otherUserId : currentUser.id;

    const existing = bookings.find(
      b => b.learnerId === learnerId && b.counsellorId === counsellorId && b.time === 'Most Trusted Chat' && b.status === 'upcoming'
    );

    if (existing) {
      setActiveSession(existing);
      navigate('/chat');
    } else {
      const bookingRef = doc(collection(db, 'bookings'));
      const newBooking: Booking = {
        id: bookingRef.id,
        learnerId,
        counsellorId,
        time: 'Most Trusted Chat',
        status: 'upcoming',
        anonymous: false,
      };
      await setDoc(bookingRef, newBooking);
      setActiveSession(newBooking);
      navigate('/chat');
      const notifyId = currentUser.role === 'learner' ? counsellorId : learnerId;
      await addNotification(notifyId, 'Direct Chat Started', `${currentUser.name} has started a direct chat.`, 'booking');
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || isLoading || !currentUser) return;
    const userMsg: Message = {
      role: 'user',
      content: chatInput,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      senderId: currentUser.id,
    };
    setChatInput('');

    if (!activeSession) return;
    // Optimistic update — sender sees message instantly; onSnapshot syncs for both parties
    setMessages(prev => [...prev, userMsg]);
    try {
      await addDoc(collection(db, 'chats', activeSession.id, 'messages'), userMsg);
    } catch (err: any) {
      console.error('Message send failed:', err);
      setMessages(prev => [
        ...prev.filter(m => m.id !== userMsg.id),
        { role: 'system', content: 'Message failed to send. Please try again.', id: 'send-err-' + Date.now(), timestamp: Date.now() },
      ]);
    }
  };

  const handleSaveScore = async (game: 'zen' | 'zip' | 'word', score: number) => {
    if (!currentUser) return;
    const docRef = doc(db, 'scores', `${currentUser.id}_${game}`);
    const existing = await getDoc(docRef);
    if (!existing.exists() || (existing.data().score as number) < score) {
      await setDoc(docRef, {
        userId: currentUser.id,
        name: currentUser.name,
        game,
        score,
        updatedAt: serverTimestamp(),
      });
    }
  };

  const handleReport = async (sessionId: string, reason: string, details: string) => {
    if (!currentUser) return;
    const adminSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'admin')));
    adminSnap.forEach(d => {
      addNotification(
        d.id,
        'Learner Report',
        `${currentUser.name} reported session ${sessionId} — ${reason}${details ? `: ${details}` : ''}`,
        'report'
      );
    });
  };

  // --- VIEWS ---
  if (authLoading) {
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

  if (currentUser.role !== 'admin' && !currentUser.popiaConsent) {
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
            onClick={() => signOut(auth)}
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
        animate={{ x: (isSidebarOpen || !isMobile) ? 0 : -320 }}
        className="fixed top-0 bottom-0 left-0 w-80 bg-brand-dark flex flex-col overflow-hidden shrink-0 z-[110] border-r-4 border-black lg:static lg:translate-x-0"
      >
        <div className="p-6 flex flex-col items-center text-center border-b-2 border-white/10 mb-2">
          <div className="p-3 bg-white rounded-3xl border-2 border-black rotate-[-3deg] shadow-[5px_5px_0px_0px_#FFD23F] mb-4">
            <YandasmLogo className="w-36 h-36" />
          </div>
          <h1 className="text-2xl font-display font-black text-white tracking-tighter uppercase leading-none">Yandasm</h1>
          <p className="text-[9px] font-black text-brand-yellow uppercase tracking-[0.15em] mt-1">Counselling & Wellness</p>
        </div>

        <nav className="flex-1 px-4 space-y-3 overflow-y-auto no-scrollbar">
          <SidebarItem icon={Home} label="Dashboard" active={currentView === 'Dashboard'} onClick={() => { navigate('/dashboard'); setIsSidebarOpen(false); }} activeColor="bg-brand-blue" />
          <SidebarItem icon={Calendar} label="My Sessions" active={currentView === 'Sessions'} onClick={() => { navigate('/sessions'); setIsSidebarOpen(false); }} activeColor="bg-brand-teal" />
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
              <p className="text-[10px] font-black text-brand-yellow/80 truncate uppercase tracking-widest leading-none mt-1">{currentUser.role}</p>
            </div>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-red-500/20 text-white rounded-xl border border-white/20 transition-all font-black uppercase text-[10px] tracking-widest"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300">
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
                <Route path="/sessions" element={<SessionsPage user={currentUser} users={users} bookings={bookings} onJoinSession={(b) => { setActiveSession(b); navigate('/chat'); }} />} />
                <Route path="/admin" element={currentUser.role === 'admin' ? <AdminPage users={users} onApprove={handleApprove} onAddCounsellor={handleAddCounsellor} bookings={bookings} notifications={notifications} onDownloadPDF={downloadPopiaPDF} /> : <Navigate to="/dashboard" replace />} />
                <Route path="/profile" element={<ProfilePage user={currentUser} onUpdate={handleUpdateProfile} onLogout={() => signOut(auth)} />} />
                <Route path="/chat" element={activeSession ? <ChatPage user={currentUser} users={users} messages={messages} chatInput={chatInput} setChatInput={setChatInput} onSend={handleSendChat} isLoading={isLoading} session={activeSession} onFinish={(id: string, rating: number) => submitRating(id, rating)} onReport={handleReport} onBack={() => navigate('/dashboard')} scrollRef={scrollRef} onUpdateUser={handleUpdateProfile} /> : <Navigate to="/dashboard" replace />} />
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
          {activeGame === 'zen'  && <ZenSlasher   onClose={() => { setActiveGame(null); setShowGame(false); }} playerName={currentUser?.name} leaderboard={zenLeaderboard}  onSaveScore={s => handleSaveScore('zen',  s)} />}
          {activeGame === 'zip'  && <ZipQuest     onClose={() => { setActiveGame(null); setShowGame(false); }} playerName={currentUser?.name} leaderboard={zipLeaderboard}  onSaveScore={s => handleSaveScore('zip',  s)} />}
          {activeGame === 'word' && <WordChallenge onClose={() => { setActiveGame(null); setShowGame(false); }} playerName={currentUser?.name} leaderboard={wordLeaderboard} onSaveScore={s => handleSaveScore('word', s)} />}
        </div>
      )}

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
