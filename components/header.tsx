'use client';

import { useState, useEffect } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Sidebar, GithubLogo, NotePencil, Person, PersonSimple, PersonSimpleTaiChi, GenderMale, DevToLogo } from '@phosphor-icons/react';
import { FaceIcon } from '@radix-ui/react-icons';

import { onAuthStateChanged } from 'firebase/auth';

export function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error) {
      console.log('Google sign-in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.log('Sign-out error:', error);
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Hide the header when scrolling down
        setIsVisible(false);
      } else {
        // Show the header when scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <>
      <header
        className={`sticky top-0 z-[500] flex items-center justify-between w-full px-4 h-14 shrink-0 bg-[#f9f9f9] dark:bg-[#1B1C1D] backdrop-blur-xl ${
          isVisible ? 'header-visible' : 'header-hidden'
        }`}
      >
        <div className="flex items-center">
          <a href="./">
            <NotePencil size={24} />
          </a>
        </div>

        {/* Logo Section */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
          <a href="https://lookinit.com/" rel="noopener" target="_blank" className="flex items-center">
            <img
              src="bg.png"
              alt="LookInit Logo"
              className="h-16 w-auto sm:h-20 lg:h-24 dark:hidden"
            />
            <img
              src="bgw.png"
              alt="LookInit Logo White"
              className="hidden dark:block h-16 w-auto sm:h-20 lg:h-24"
            />
          </a>
        </div>
        {/* Login/Signup Buttons */}
        <div className="ml-auto flex items-center gap-2 header-buttons">
          {user ? (
            <div className="flex items-center gap-2">
              {user.photoURL && (
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User profile'} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <Button variant="ghost" onClick={handleSignOut}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="flex items-center gap-1" onClick={handleGoogleSignIn}>
                <PersonSimple size={18} />
                <span className="hidden sm:inline">Login with Google</span>
                <span className="sm:hidden">Login</span>
              </Button>
            </div>
          )}
        </div>



        {/* GitHub and DevTo
        <div className="ml-auto flex items-center gap-4">
          <a
            target="_blank"
            href="https://github.com/abhishzk"
            rel="noopener noreferrer"
          >
            <GithubLogo size={24} />
          </a>
          <a
            target="_blank"
            href="https://abhishzk.com"
            rel="noopener"
          >
            <DevToLogo size={24} />
          </a>
        </div>  */}
      </header>

      {/* <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} /> */}
    </>
  );
}// const Sidebar = ({ isOpen, onClose }) => {
//   const [settings, setSettings] = useState({
//     model: 'groq-mixtral',
//     toggleSetting: false,
//     dropdownSetting: 'Option 1',
//     textChunkSize: 1000,
//     textChunkOverlap: 400,
//     similarityResults: 4,
//     pagesToScan: 10,
//   });

//   useEffect(() => {
//     const storedSettings = localStorage.getItem('settings');
//     if (storedSettings) {
//       setSettings(JSON.parse(storedSettings));
//     }
//   }, []);

//   useEffect(() => {
//     localStorage.setItem('settings', JSON.stringify(settings));
//   }, [settings]);

//   const handleSettingsChange = (field, value) => {
//     setSettings((prevSettings) => ({
//       ...prevSettings,
//       [field]: value,
//     }));
//   };

//   return (
//     <div
//       className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
//         }`}
//     >
//       <div className="flex flex-col h-full">
//         <div className="flex items-center justify-between px-4 py-3 border-b">
//           <h2 className="text-lg font-semibold">Settings</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-600 focus:outline-none"
//           >
//             <svg
//               className="w-6 h-6"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M6 18L18 6M6 6l12 12"
//               />
//             </svg>
//           </button>
//         </div>
//         <div className="flex-1 px-4 py-6 overflow-y-auto">
//           <div className="mb-4">
//             <label className="block mb-2 font-semibold">Model</label>
//             <select
//               value={settings.model}
//               onChange={(e) => handleSettingsChange('model', e.target.value)}
//               className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             >
//               <option value="groq-mixtral">Groq: Mixtral</option>
//               <option value="groq-llama-2-70b">Groq: Llama 2 70B</option>
//               <option value="groq-gemma">Groq: Gemma</option>
//             </select>
//           </div>
//           <div className="mb-4">
//             <label className="block mb-2 font-semibold">Model</label>
//             <select
//               value={settings.model}
//               onChange={(e) => handleSettingsChange('model', e.target.value)}
//               className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             >
//               <option value="groq-mixtral">Groq: Mixtral</option>
//               <option value="groq-llama-2-70b">Groq: Llama 2 70B</option>
//               <option value="groq-gemma">Groq: Gemma</option>
//             </select>
//           </div>
//           <div className="mb-4">
//             <label className="block mb-2 font-semibold">Model for Follow Up questions</label>
//             <select
//               value={settings.model}
//               onChange={(e) => handleSettingsChange('model', e.target.value)}
//               className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             >
//               <option value="groq-mixtral">Groq: Mixtral</option>
//               <option value="groq-llama-2-70b">Groq: Llama 2 70B</option>
//               <option value="groq-gemma">Groq: Gemma</option>
//             </select>
//           </div>
//           <div className="mb-4">
//             <label className="block mb-2 font-semibold">Model for Function Calling</label>
//             <select
//               value={settings.model}
//               onChange={(e) => handleSettingsChange('model', e.target.value)}
//               className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             >
//               <option value="groq-mixtral">Groq: Mixtral</option>
//               <option value="groq-llama-2-70b">Groq: Llama 2 70B</option>
//               <option value="groq-gemma">Groq: Gemma</option>
//             </select>
//           </div>
//           <div className="mb-4">
//             <label className="block mb-2 font-semibold">Show Sources in UI</label>
//             <div className="relative inline-block w-10 mr-2 align-middle select-none">
//               <input
//                 type="checkbox"
//                 checked={settings.toggleSetting}
//                 onChange={(e) => handleSettingsChange('toggleSetting', e.target.checked)}
//                 className="absolute block w-6 h-6 bg-white border-4 rounded-full appearance-none cursor-pointer"
//               />
//               <label className="block h-6 overflow-hidden bg-gray-300 rounded-full cursor-pointer"></label>
//             </div>
//           </div>
//           <div className="mb-4">
//             <h3 className="mb-2 font-semibold">Advanced Options</h3>
//             <div className="mb-4">
//               <label className="block mb-2 font-semibold">
//                 Text Chunk Size: {settings.textChunkSize}
//               </label>
//               <input
//                 type="range"
//                 min="500"
//                 max="2000"
//                 step="100"
//                 value={settings.textChunkSize}
//                 onChange={(e) => handleSettingsChange('textChunkSize', Number(e.target.value))}
//                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//               />
//             </div>
//             <div className="mb-4">
//               <label className="block mb-2 font-semibold">
//                 Text Chunk Overlap: {settings.textChunkOverlap}
//               </label>
//               <input
//                 type="range"
//                 min="200"
//                 max="800"
//                 step="100"
//                 value={settings.textChunkOverlap}
//                 onChange={(e) => handleSettingsChange('textChunkOverlap', Number(e.target.value))}
//                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//               />
//             </div>
//             <div className="mb-4">
//               <label className="block mb-2 font-semibold">
//                 Number of Similarity Results: {settings.similarityResults}
//               </label>
//               <input
//                 type="range"
//                 min="2"
//                 max="10"
//                 step="1"
//                 value={settings.similarityResults}
//                 onChange={(e) => handleSettingsChange('similarityResults', Number(e.target.value))}
//                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//               />
//             </div>
//             <div className="mb-4">
//               <label className="block mb-2 font-semibold">
//                 Number of Pages to Scan: {settings.pagesToScan}
//               </label>
//               <input
//                 type="range"
//                 min="1"
//                 max="10"
//                 step="1"
//                 value={settings.pagesToScan}
//                 onChange={(e) => handleSettingsChange('pagesToScan', Number(e.target.value))}
//                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;