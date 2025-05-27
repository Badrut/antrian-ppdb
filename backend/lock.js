// utils/globalLock.js
let isLocked = false;

export const acquireGlobalLock = async () => {
  while (isLocked) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Delay 100 ms dan coba lagi
  }
  isLocked = true;
};

export const releaseGlobalLock = () => {
  isLocked = false;
};
