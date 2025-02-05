'use client';

import { useState, useEffect } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Sidebar as SidebarIcon, NotePencil, X, PersonSimple } from '@phosphor-icons/react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.log('Sign-out error:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
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
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 dark:bg-[#282a2c] bg-white text-white p-5 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-[1000]`}>
        {/* Close Button */}
        <button onClick={toggleSidebar} className="absolute top-4 right-4 text-white ">
          <X size={24} className="text-black dark:text-white hover:bg-gray-300 hover:dark:bg-[#3b3e41]" />
        </button>

        {/* Sidebar Links */}
        <nav className="mt-10">
          <a href="./" className="flex items-center gap-2 p-2 hover:dark:bg-[#3b3e41] rounded-md text-black dark:text-white hover:bg-gray-100">
            <NotePencil size={24} className="text-black dark:text-white hover:bg-gray-300"/> New Chat
          </a>
        </nav>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-[999]" onClick={toggleSidebar} />}

      {/* Header */}
      <header className={`sticky top-0 z-[500] flex items-center justify-between w-full px-4 h-14 shrink-0 bg-[#f9f9f9] dark:bg-[#1B1C1D] backdrop-blur-xl ${isVisible ? 'header-visible' : 'header-hidden'}`}>
        {/* Sidebar Toggle Button */}
        <button onClick={toggleSidebar} className="p-2 hover:bg-gray-300 hover:dark:bg-[#282a2c] text-black rounded-md">
          <SidebarIcon size={24} className="text-black dark:text-white" />
        </button>

        {/* Logo Section */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
          <a href="https://lookinit.com/" rel="noopener" target="_blank" className="flex items-center">
            <img src="bg.png" alt="LookInit Logo" className="h-16 w-auto sm:h-20 lg:h-24 dark:hidden" />
            <img src="bgw.png" alt="LookInit Logo White" className="hidden dark:block h-16 w-auto sm:h-20 lg:h-24" />
          </a>
        </div>

        {/* Login/Signup / Profile Dropdown */}
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="w-10 h-10 rounded-full overflow-hidden border border-gray-300">
                  <img
                    src={user.photoURL || "/default-avatar.png"} 
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  className="w-48 bg-white dark:bg-[#282a2c] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-2 z-[1000] mt-1"
                >
                  <DropdownMenu.Item
                    onClick={handleSignOut}
                    className="p-2 hover:dark:bg-[#3b3e41] hover:bg-gray-300 rounded-md text-red-600 dark:text-red-400 cursor-pointer"
                  >
                    Logout
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <Button variant="ghost" className="flex items-center gap-1" onClick={handleGoogleSignIn}>
              <PersonSimple size={18} />
              <span className="hidden sm:inline">Login with Google</span>
              <span className="sm:hidden">Login</span>
            </Button>
          )}
        </div>
      </header>
    </>
  );
}





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
      

      {/* <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} /> */}
 // const Sidebar = ({ isOpen, onClose }) => {
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