/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import styles from './RemoteLoader.module.css';


const REMOTE_CONFIG = {
  feed: { loadModule: () => import('remote_vue/VueRoot'), mountFnName: 'mountVue' },
  board: { loadModule: () => import('remote_angular/AngularRoot'), mountFnName: 'mountAngular' }
};

function LoadingSkeleton({ name }) {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonBadge} />
      </div>
      <div className={styles.skeletonBody}>
        <div className={styles.skeletonLine} style={{ width: '85%' }} />
        <div className={styles.skeletonLine} style={{ width: '65%' }} />
        <div className={styles.skeletonLine} style={{ width: '75%' }} />
      </div>
      <div className={styles.loadingLabel}>
        <span className={styles.loadingDot} />
        <span className={styles.loadingDot} style={{ animationDelay: '0.2s' }} />
        <span className={styles.loadingDot} style={{ animationDelay: '0.4s' }} />
        <span>Connecting to {name} remote</span>
      </div>
    </div>
  )
}

function PlaceholderRemote({ name, tag, port, color, onRetry }) {
  return (
    <div className={styles.placeholder} style={{ '--remote-color': color }}>
      <div className={styles.placeholderHeader}>
        <span className={styles.placeholderTag} style={{ color, borderColor: `${color}44`, background: `${color}0f` }}>
          {tag}
        </span>
        <h2 className={styles.placeholderTitle}>{name}</h2>
      </div>
      <div className={styles.placeholderBody}>
        <div className={styles.placeholderTerminal}>
          <div className={styles.terminalBar}>
            <span className={styles.termDot} style={{ background: '#f85149' }} />
            <span className={styles.termDot} style={{ background: '#d29922' }} />
            <span className={styles.termDot} style={{ background: '#3fb950' }} />
            <span className={styles.termTitle}>module-federation</span>
          </div>
          <div className={styles.terminalBody}>
            <div className={styles.termLine}>
              <span className={styles.termPrompt}>$</span>
              <span className={styles.termCmd}>cd remote-{name.toLowerCase().replace('the ', '')}</span>
            </div>
            <div className={styles.termLine}>
              <span className={styles.termPrompt}>$</span>
              <span className={styles.termCmd}>npm run build && npm run preview</span>
            </div>
            <div className={styles.termLine}>
              <span className={styles.termOutput} style={{ color: '#3fb950' }}>
                ✓ Waiting for connection on localhost:{port}
              </span>
            </div>
          </div>
        </div>
        <button className={styles.retryBtn} onClick={onRetry} style={{width: 'fit-content'}}>
          ↻ Retry Connection
        </button>
      </div>
    </div>
  )
}

export default function RemoteLoader({ remoteId }) {
  const { updateRemoteStatus, navItems } = useApp();
  const [key, setKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const mountRef = useRef(null);

  const navItem = navItems.find(n => n.id === remoteId);
  const config = REMOTE_CONFIG[remoteId];

  const handleRetry = useCallback(() => {
    setKey(k => k + 1);
    setIsLoading(true);
    setHasError(false);
  }, []);

  useEffect(() => {
    if (!config) return;

    let appInstance = null;
    setIsLoading(true);
    updateRemoteStatus(remoteId, 'connecting');

    config.loadModule()
      .then((module) => {
        const mount = module[config.mountFnName] || (module.default && module.default[config.mountFnName]);
        if (mountRef.current) {
          mountRef.current.innerHTML = ''; 
          if (typeof mount === 'function') {
            appInstance = mount(mountRef.current);
            setIsLoading(false);
            updateRemoteStatus(remoteId, 'online');
          } else {
            throw new Error(`Mount function ${config.mountFnName} not found`);
          }
        }
      })
      .catch(err => {
        console.error(`Gagal meload remote ${remoteId}:`, err);
        setHasError(true);
        setIsLoading(false);
        updateRemoteStatus(remoteId, 'offline');
      });

    return () => {
      if (appInstance && typeof appInstance.unmount === 'function') {
        appInstance.unmount();
      }
    };
  }, [remoteId, config, updateRemoteStatus, key]);

  if (!config || !navItem) return <div className={styles.errorState}>Unknown remote: {remoteId}</div>;

  return (
    <div className={styles.remoteContainer} key={key}>
      {isLoading && <LoadingSkeleton name={navItem.label} />}
      
      {hasError && !isLoading && (
        <PlaceholderRemote 
          name={navItem.label} 
          tag={navItem.tag} 
          port={navItem.port} 
          color={navItem.tagColor} 
          onRetry={handleRetry} 
        />
      )}

      <div 
          ref={mountRef} 
          style={{ display: (isLoading || hasError) ? 'none' : 'block', height: '100%', width: '100%' }}
        />
    </div>
  );
}