'use client'

import { Duration } from 'luxon';
import React from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import "videojs-youtube";

export const VideoJS = (props) => {
  const videoRef = React.useRef(null);
  const playerRef = React.useRef(null);
  const { options = {}, onReady } = props;

  React.useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");

      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current?.appendChild?.(videoElement);

      const player = playerRef.current = videojs(videoElement, options, () => {
        videojs.log('player is ready');
        props.onTimeUpdate && player?.on('timeupdate', () => {
          requestAnimationFrame(() => {
            const currentTimeInMs = player.currentTime() * 1000;
            const formattedTime = Duration.fromMillis(currentTimeInMs).toFormat('hh:mm:ss.SSS');
            props.onTimeUpdate?.(formattedTime);
          });
        });

        onReady && onReady(player);
      });


    } else {
      const player = playerRef.current;

      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, videoRef]);

  React.useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
}

export default VideoJS;
