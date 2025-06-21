import { useEffect, useRef, useState, useCallback } from 'react';
import QrScanner from 'qr-scanner';
import classes from './QrScanner.module.scss';
import {
  IconBulb,
  IconBulbOff,
  IconCameraRotate,
  IconVolume,
  IconVolumeOff,
  IconX,
} from '@tabler/icons-react';
import { Anchor, Button, Menu } from '@mantine/core';
import { showError } from '../../../utils/notifications.tsx';
import { Trans, useTranslation } from 'react-i18next';

interface QRScannerComponentProps {
  onCheckOut?: (
    attendeeId: string,
    onComplete: (success: boolean) => void,
    onError: () => void,
  ) => void;
  onCheckIn: (
    attendeePublicId: string,
    onRequestComplete: (didSucceed: boolean) => void,
    onFailure: () => void,
  ) => void;
  onClose: () => void;
}

type ScanState = 'idle' | 'processing' | 'success' | 'error';

export const QRScannerComponent = ({
  onCheckIn,
  onCheckOut,
  onClose,
}: QRScannerComponentProps): React.ReactElement => {
  const { t } = useTranslation();

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const scanCooldownRef = useRef<Set<string>>(new Set());
  const isInitializingRef = useRef(false);

  // Audio refs
  const audioRefs = useRef({
    success: new Audio('/sounds/scan-success.wav'),
    error: new Audio('/sounds/scan-error.wav'),
    processing: new Audio('/sounds/scan-in-progress.wav'),
  });

  // State
  const [permissionState, setPermissionState] = useState<
    'granted' | 'denied' | 'pending'
  >('pending');
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [isCheckOutMode, setIsCheckOutMode] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isFlashAvailable, setIsFlashAvailable] = useState(false);
  const [cameras, setCameras] = useState<QrScanner.Camera[]>([]);
  const [isSoundOn, setIsSoundOn] = useState(() => {
    const stored = localStorage.getItem('qrScannerSoundOn');
    return stored === null ? true : JSON.parse(stored);
  });

  // Play audio helper
  const playAudio = useCallback(
    (type: keyof typeof audioRefs.current) => {
      if (isSoundOn) {
        audioRefs.current[type].play().catch(() => {});
      }
    },
    [isSoundOn],
  );

  // Handle scan result
  const handleScanResult = useCallback(
    async (data: string) => {
      // Prevent processing during cooldown or if already processing
      if (scanCooldownRef.current.has(data) || scanState === 'processing') {
        return;
      }

      // Add to cooldown
      scanCooldownRef.current.add(data);
      setTimeout(() => {
        scanCooldownRef.current.delete(data);
      }, 2000);

      setScanState('processing');
      playAudio('processing');

      try {
        const handler = isCheckOutMode ? onCheckOut : onCheckIn;

        if (!handler) {
          throw new Error(t`Operation not supported`);
        }

        await new Promise<void>((resolve, reject) => {
          handler(
            data,
            (success) => {
              if (success) {
                resolve();
              } else {
                reject(new Error(t`Operation failed`));
              }
            },
            () => {
              reject(new Error(t`Operation failed`));
            },
          );
        });

        setScanState('success');
        playAudio('success');

        // Reset state after success animation
        setTimeout(() => {
          setScanState('idle');
        }, 1000);
      } catch (error) {
        console.error('Scan processing error:', error);
        setScanState('error');
        playAudio('error');

        // Reset state after error animation
        setTimeout(() => {
          setScanState('idle');
        }, 1000);
      }
    },
    [scanState, isCheckOutMode, onCheckIn, onCheckOut, playAudio, t],
  );

  // Initialize scanner
  const initializeScanner = useCallback(async () => {
    if (isInitializingRef.current || !videoRef.current) {
      return;
    }

    isInitializingRef.current = true;

    try {
      // Request camera permission
      await navigator.mediaDevices.getUserMedia({ video: true });
      setPermissionState('granted');

      // Clean up existing scanner
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }

      // Create new scanner
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleScanResult(result.data),
        {
          maxScansPerSecond: 2,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        },
      );

      await qrScannerRef.current.start();

      // Check flash availability
      const hasFlash = await qrScannerRef.current.hasFlash();
      setIsFlashAvailable(hasFlash);

      // Get available cameras
      const availableCameras = await QrScanner.listCameras(true);
      setCameras(availableCameras);
    } catch (error) {
      console.error('Scanner initialization failed:', error);
      setPermissionState('denied');
    } finally {
      isInitializingRef.current = false;
    }
  }, [handleScanResult]);

  // Cleanup scanner
  const cleanupScanner = useCallback(() => {
    if (qrScannerRef.current) {
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    isInitializingRef.current = false;
  }, []);

  // Toggle flash
  const toggleFlash = useCallback(async () => {
    if (!qrScannerRef.current || !isFlashAvailable) {
      showError(t`Flash is not available on this device`);
      return;
    }

    try {
      if (isFlashOn) {
        await qrScannerRef.current.turnFlashOff();
      } else {
        await qrScannerRef.current.turnFlashOn();
      }
      setIsFlashOn(!isFlashOn);
    } catch (error) {
      console.error('Flash toggle failed:', error);
      showError(t`Failed to toggle flash`);
    }
  }, [isFlashOn, isFlashAvailable, t]);

  // Switch camera
  const switchCamera = useCallback(
    (camera: QrScanner.Camera) => async () => {
      if (!qrScannerRef.current) return;

      try {
        await qrScannerRef.current.setCamera(camera.id);
        // Recheck flash availability after camera switch
        const hasFlash = await qrScannerRef.current.hasFlash();
        setIsFlashAvailable(hasFlash);
        if (!hasFlash) {
          setIsFlashOn(false);
        }
      } catch (error) {
        console.error('Camera switch failed:', error);
        showError(t`Failed to switch camera`);
      }
    },
    [t],
  );

  // Toggle mode
  const toggleMode = useCallback(() => {
    setIsCheckOutMode((prev) => !prev);
    setScanState('idle');
    scanCooldownRef.current.clear();
  }, []);

  // Toggle sound
  const toggleSound = useCallback(() => {
    setIsSoundOn((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem('qrScannerSoundOn', JSON.stringify(newValue));
      return newValue;
    });
  }, []);

  // Request permission
  const requestPermission = useCallback(() => {
    setPermissionState('pending');
    initializeScanner();
  }, [initializeScanner]);

  // Close scanner
  const handleClose = useCallback(() => {
    cleanupScanner();
    onClose();
  }, [cleanupScanner, onClose]);

  // Initialize on mount and when mode changes
  useEffect(() => {
    initializeScanner();
    return cleanupScanner;
  }, [initializeScanner]);

  // Render permission denied state
  if (permissionState === 'denied') {
    return (
      <div className={classes.videoContainer}>
        <div className={classes.permissionMessage}>
          <Trans>
            Camera permission was denied.{' '}
            <Anchor onClick={requestPermission}>Request Permission</Anchor>{' '}
            again, or if this doesn't work, you will need to{' '}
            <Anchor
              target={'_blank'}
              href={
                'https://support.onemob.com/hc/en-us/articles/360037342154-How-do-I-grant-permission-for-Camera-and-Microphone-in-my-web-browser-'
              }
            >
              grant this page
            </Anchor>{' '}
            access to your camera in your browser settings.
          </Trans>
          <div>
            <Button
              color={'green'}
              mt={20}
              onClick={handleClose}
              variant={'filled'}
            >
              {t`Close`}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.videoContainer}>
      <video className={classes.video} ref={videoRef} />

      {/* Flash Toggle */}
      <Button
        onClick={toggleFlash}
        variant={'transparent'}
        className={classes.flashToggle}
      >
        {!isFlashAvailable && <IconBulbOff color={'#ffffff95'} size={30} />}
        {isFlashAvailable && (
          <IconBulb color={isFlashOn ? 'yellow' : '#ffffff95'} size={30} />
        )}
      </Button>

      {/* Sound Toggle */}
      <Button
        onClick={toggleSound}
        variant={'transparent'}
        className={classes.soundToggle}
      >
        {isSoundOn ? (
          <IconVolume color={'#ffffff95'} size={30} />
        ) : (
          <IconVolumeOff color={'#ffffff95'} size={30} />
        )}
      </Button>

      {/* Mode Toggle */}
      <Button
        onClick={toggleMode}
        variant={'filled'}
        className={classes.modeToggle}
        color={isCheckOutMode ? 'red' : 'green'}
        disabled={scanState === 'processing'}
      >
        {isCheckOutMode ? t`Check Out Mode` : t`Check In Mode`}
      </Button>

      {/* Close Button */}
      <Button
        onClick={handleClose}
        variant={'transparent'}
        className={classes.closeButton}
      >
        <IconX color={'#ffffff95'} size={30} />
      </Button>

      {/* Camera Switch */}
      <Button variant={'transparent'} className={classes.switchCameraButton}>
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <IconCameraRotate color={'#ffffff95'} size={30} />
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>{t`Select Camera`}</Menu.Label>
            {cameras.map((camera, index) => (
              <Menu.Item key={index} onClick={switchCamera(camera)}>
                {camera.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </Button>

      {/* Scanner Overlay */}
      <div
        className={`${classes.scannerOverlay} ${
          scanState === 'success' ? classes.success : ''
        } ${scanState === 'error' ? classes.failure : ''} ${
          scanState === 'processing' ? classes.checkingIn : ''
        } ${isCheckOutMode ? classes.checkOut : classes.checkIn}`}
      >
        <div className={classes.modeIndicator}>
          {isCheckOutMode ? t`Check Out Mode` : t`Check In Mode`}
        </div>
      </div>
    </div>
  );
};
