export const ASSISTANT_CONFIG = {
  name: 'Anup Rawat',
  status: 'AI assistant · Online',
  logo: '/ar-monogram.png',
  apiUrl: process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://localhost:5000/api/chat',
  teaser: 'Namaste! Shoot ya booking ke baare mein kuch poochna hai?',
  welcome:
    'Namaste! Main Anup Rawat ka AI assistant hu. Shoot booking, packages ya portfolio, jo bhi poochna ho.',
  placeholder: 'Apna sawaal likhiye...',
  errorReply: 'Abhi connect nahi ho pa raha, thodi der baad try kijiye.',
  teaserDelay: 900,
  chips: [
    'Wedding shoot book karna hai',
    'Packages kya hain?',
    'Portfolio dikhao',
    'Meri date available hai?',
  ],
};
