import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithCustomToken, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, onSnapshot, query, updateDoc } from 'firebase/firestore';
import { Trophy, Gift, Users, LogOut, Star, Target, Award, Loader2, Edit, X } from 'lucide-react';

// --- Helper Functions & Constants ---

// This function generates a random referral code.
const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// --- Firebase Initialization ---

// NOTE: Your Firebase config is sensitive and should not be committed to a public repository.
// It's best to use environment variables for this in a real project.
const firebaseConfigFromUser = {
  apiKey: "AIzaSyC6of6J7JT7iYWPj_23H-3UnJLdTauTrTY",
  authDomain: "intern-dashboard-addbf.firebaseapp.com",
  projectId: "intern-dashboard-addbf",
  storageBucket: "intern-dashboard-addbf.firebasestorage.app",
  messagingSenderId: "978721421112",
  appId: "1:978721421112:web:a35a40bbcc02639a8933cd",
  measurementId: "G-KV7B0MSNZZ"
};

// The code will try to use the environment's config first, and fall back to your
// local config if it's not available.
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : firebaseConfigFromUser;

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// --- UI Components ---

const LoadingSpinner = ({ message }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="animate-spin rounded-full h-12 w-12 text-indigo-600 mx-auto" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  </div>
);

const LoginPage = ({ onLogin, onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuthAction = async (action) => {
    if (!email || !password) {
        setError('Please enter both email and password.');
        return;
    }
    setIsLoading(true);
    setError('');
    try {
      await action(email, password);
      // The parent component will handle navigation after successful login/signup.
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Intern Rewards</h1>
          <p className="text-gray-600">Track your impact and unlock rewards</p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleAuthAction(onLogin)}
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center disabled:bg-indigo-400"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
            </button>
            <button
              onClick={() => handleAuthAction(onSignUp)}
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center disabled:bg-green-400"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const Navigation = ({ activePage, setActivePage, onLogout }) => (
  <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center space-x-8">
          <div className="flex items-center">
            <Trophy className="w-8 h-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Intern Rewards</span>
          </div>
          <div className="hidden md:flex space-x-4">
            <button
              onClick={() => setActivePage('dashboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activePage === 'dashboard'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActivePage('leaderboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activePage === 'leaderboard'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Leaderboard
            </button>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md text-sm font-medium"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
       {/* Mobile Navigation */}
       <div className="md:hidden flex justify-center space-x-4 py-2 border-t">
          <button
            onClick={() => setActivePage('dashboard')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activePage === 'dashboard'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActivePage('leaderboard')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activePage === 'leaderboard'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600'
            }`}
          >
            Leaderboard
          </button>
        </div>
    </div>
  </nav>
);

const EditProfileModal = ({ isOpen, onClose, internData, userId }) => {
    const [name, setName] = useState(internData.name);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setName(internData.name);
    }, [internData.name]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!name.trim()) return;
        setIsSaving(true);
        try {
            // Update both the private user profile and the public leaderboard entry
            const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile`, 'data');
            const leaderboardDocRef = doc(db, `artifacts/${appId}/public/data/leaderboard`, userId);
            
            await updateDoc(userDocRef, { name: name.trim() });
            await updateDoc(leaderboardDocRef, { name: name.trim() });

            onClose();
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X size={24} />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center disabled:bg-indigo-400"
                    >
                        {isSaving ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Dashboard = ({ internData, rewards, userId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  if (!internData) return <LoadingSpinner message="Loading your dashboard..." />;

  const currentPoints = Math.floor((internData.totalDonations || 0) / 10);

  return (
    <>
      <EditProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} internData={internData} userId={userId} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {internData.name}! 👋
            </h1>
            <button onClick={() => setIsModalOpen(true)} className="text-gray-500 hover:text-indigo-600 transition-colors">
                <Edit size={20} />
            </button>
          </div>
          <p className="text-gray-600">Track your fundraising progress and unlock amazing rewards.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard icon={<Target />} color="green" title="Total Donations" value={`$${(internData.totalDonations || 0).toLocaleString()}`} footer={`From ${internData.donationsCount || 0} donations`} />
          <StatCard icon={<Star />} color="indigo" title="Reward Points" value={currentPoints.toLocaleString()} footer="1 point = $10 raised" />
          <StatCard icon={<Users />} color="purple" title="Referral Code" value={internData.referralCode} footer="Share with friends to earn more!" />
        </div>

        {/* Rewards Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center mb-6">
            <Gift className="w-6 h-6 text-indigo-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Available Rewards</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <RewardCard key={reward.id} reward={reward} currentPoints={currentPoints} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const StatCard = ({ icon, color, title, value, footer }) => {
    const colors = {
        green: { bg: 'bg-green-100', text: 'text-green-600' },
        indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
        purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    };
    const selectedColor = colors[color] || colors.indigo;

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className={`text-3xl font-bold ${selectedColor.text}`}>{value}</p>
                </div>
                <div className={`${selectedColor.bg} p-3 rounded-full`}>
                    {React.cloneElement(icon, { className: `w-6 h-6 ${selectedColor.text}` })}
                </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{footer}</p>
        </div>
    );
};


const RewardCard = ({ reward, currentPoints }) => {
  const unlocked = currentPoints >= reward.points;
  return (
    <div
      className={`rounded-lg border p-6 transition-all ${
        unlocked
          ? 'border-green-200 bg-green-50 hover:shadow-md'
          : 'border-gray-200 bg-gray-50 opacity-75'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{reward.icon}</span>
        {unlocked && (
          <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
            Unlocked
          </div>
        )}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{reward.title}</h3>
      <p className="text-sm text-gray-600 mb-4 h-10">{reward.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-indigo-600">
          {reward.points.toLocaleString()} points
        </span>
        <button
          disabled={!unlocked}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            unlocked
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {unlocked ? 'Claim' : 'Locked'}
        </button>
      </div>
    </div>
  );
};

const Leaderboard = ({ leaderboardData, userId }) => {
  
  const getRankIcon = (position) => {
    if (position === 1) return <span className="text-2xl">🥇</span>;
    if (position === 2) return <span className="text-2xl">🥈</span>;
    if (position === 3) return <span className="text-2xl">🥉</span>;
    return <span className="text-lg font-bold text-gray-500">#{position}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard 🏆</h1>
        <p className="text-gray-600">See how you rank against other interns.</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intern</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Raised</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboardData.map((intern, index) => {
                const position = index + 1;
                const isCurrentUser = intern.id === userId;
                const points = Math.floor((intern.totalDonations || 0) / 10);
                return (
                  <tr key={intern.id} className={`hover:bg-gray-50 transition-colors ${isCurrentUser ? 'bg-indigo-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">{getRankIcon(position)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-gray-300 text-gray-700 font-medium">
                          {(intern.name || '').split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${isCurrentUser ? 'text-indigo-900' : 'text-gray-900'}`}>
                            {intern.name} {isCurrentUser && <span className="text-indigo-600">(You)</span>}
                          </div>
                          <div className="text-sm text-gray-500">{intern.referralCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${(intern.totalDonations || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                      {points.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [user, setUser] = useState(null);
  const [internData, setInternData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [activePage, setActivePage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // --- Authentication Handling ---
  const handleSignUp = useCallback(async (email, password) => {
    await createUserWithEmailAndPassword(auth, email, password);
  }, []);
  
  const handleLogin = useCallback(async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const handleLogout = () => {
    signOut(auth);
    // Resetting state
    setUser(null);
    setInternData(null);
    setActivePage('dashboard');
  };

  // --- Effect for Auth State ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      if (currentUser) {
        setUser(currentUser);
        // Check if user document exists, if not, create one
        const userDocPath = `artifacts/${appId}/users/${currentUser.uid}/profile`;
        const userDocRef = doc(db, userDocPath, 'data');
        const docSnap = await getDoc(userDocRef);

        if (!docSnap.exists()) {
          const newUserName = currentUser.email 
            ? currentUser.email.split('@')[0] 
            : `Intern #${Math.floor(1000 + Math.random() * 9000)}`;
            
          const newUser = {
            name: newUserName,
            referralCode: generateReferralCode(),
            totalDonations: 0,
            donationsCount: 0,
          };
          await setDoc(userDocRef, newUser);
          
          // Also add to public leaderboard collection
          const leaderboardDocRef = doc(db, `artifacts/${appId}/public/data/leaderboard`, currentUser.uid);
          await setDoc(leaderboardDocRef, {
             name: newUser.name,
             referralCode: newUser.referralCode,
             totalDonations: newUser.totalDonations,
          });
        }
      } else {
        setUser(null);
        setInternData(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [appId]);

  // --- Effect for Firestore Data Subscriptions ---
  useEffect(() => {
    if (!user) return;

    // Subscribe to the current user's private data
    const userDocPath = `artifacts/${appId}/users/${user.uid}/profile`;
    const userDocRef = doc(db, userDocPath, 'data');
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setInternData({ id: doc.id, ...doc.data() });
      }
    }, (error) => console.error("Error fetching user data:", error));

    // Subscribe to the public leaderboard data
    const leaderboardColPath = `artifacts/${appId}/public/data/leaderboard`;
    const qLeaderboard = query(collection(db, leaderboardColPath));
    const unsubscribeLeaderboard = onSnapshot(qLeaderboard, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => b.totalDonations - a.totalDonations);
      setLeaderboardData(data);
    }, (error) => console.error("Error fetching leaderboard:", error));

    // Subscribe to the public rewards data
    const rewardsColPath = `artifacts/${appId}/public/data/rewards`;
    const qRewards = query(collection(db, rewardsColPath));
    const unsubscribeRewards = onSnapshot(qRewards, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => a.points - b.points);
        setRewards(data);
    }, (error) => console.error("Error fetching rewards:", error));


    return () => {
      unsubscribeUser();
      unsubscribeLeaderboard();
      unsubscribeRewards();
    };
  }, [user, appId]);

  // This effect handles the initial authentication check when running outside the platform
  useEffect(() => {
    const checkInitialAuth = async () => {
        // If running in the platform, a token might be available
        const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
        if (token) {
            try {
                await signInWithCustomToken(auth, token);
            } catch (error) {
                console.error("Custom token sign-in failed:", error)
            }
        }
        setIsLoading(false);
    }
    checkInitialAuth();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Initializing app..." />;
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} />
      <main>
        {activePage === 'dashboard' && <Dashboard internData={internData} rewards={rewards} userId={user.uid} />}
        {activePage === 'leaderboard' && <Leaderboard leaderboardData={leaderboardData} userId={user.uid} />}
      </main>
    </div>
  );
};

export default App;
