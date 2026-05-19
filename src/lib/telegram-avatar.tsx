import React, { useState, useEffect } from 'react';

export async function getTelegramAvatarUrl(chatId: string): Promise<string | null> {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return null;

  const userId = chatId.replace(/\D/g, '');
  if (!userId) return null;

  console.log('[Avatar] getTelegramAvatarUrl called for chatId:', chatId, 'using token:', token ? token.substring(0, 10) + '...' : 'undefined');
  try {
    const photosRes = await fetch(`https://api.telegram.org/bot${token}/getUserProfilePhotos?user_id=${userId}&limit=1`);
    console.log('[Avatar] getUserProfilePhotos response status:', photosRes.status);
    if (!photosRes.ok) {
      console.warn('[Avatar] getUserProfilePhotos failed:', photosRes.statusText);
      return null;
    }
    const photosData = await photosRes.json();
    console.log('[Avatar] getUserProfilePhotos data:', photosData);
    
    if (photosData.ok && photosData.result?.total_count > 0) {
      const photos = photosData.result.photos[0];
      const fileId = photos[0]?.file_id;
      if (!fileId) {
        console.warn('[Avatar] No fileId found in photos');
        return null;
      }

      console.log('[Avatar] Found fileId:', fileId, 'fetching file info...');
      const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
      console.log('[Avatar] getFile response status:', fileRes.status);
      if (!fileRes.ok) {
        console.warn('[Avatar] getFile failed:', fileRes.statusText);
        return null;
      }
      const fileData = await fileRes.json();
      console.log('[Avatar] getFile data:', fileData);

      if (fileData.ok && fileData.result?.file_path) {
        const fullUrl = `https://api.telegram.org/file/bot${token}/${fileData.result.file_path}`;
        console.log('[Avatar] Successfully resolved avatar URL:', fullUrl);
        return fullUrl;
      }
    } else {
      console.log('[Avatar] No profile photos found for user', userId);
    }
  } catch (err) {
    console.error('[Avatar] Error fetching Telegram avatar in browser:', err);
  }
  return null;
}

export const UserAvatar = ({ token, name, size = 32 }: { token: string; name: string; size?: number }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    
    const cacheKey = `tg_avatar_${token}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setAvatarUrl(cached);
      return;
    }

    let isMounted = true;
    const fetchAvatar = async () => {
      const url = await getTelegramAvatarUrl(token);
      if (url && isMounted) {
        setAvatarUrl(url);
        sessionStorage.setItem(cacheKey, url);
      }
    };

    fetchAvatar();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const initials = name ? name.charAt(0).toUpperCase() : 'U';

  if (avatarUrl) {
    return (
      <img 
        src={avatarUrl} 
        alt={name} 
        className="rounded-full object-cover border border-primary/20 shadow-sm shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div 
      className="rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
};
