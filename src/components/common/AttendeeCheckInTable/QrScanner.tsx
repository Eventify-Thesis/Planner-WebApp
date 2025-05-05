import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { useDebouncedValue } from '@mantine/hooks';
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
import { AttendeeModel } from '@/domain/OrderModel.ts';

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

export const QRScannerComponent = ({
  attendees,
  onCheckIn,
  onCheckOut,
}: QRScannerComponentProps): React.ReactElement => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const isProcessingRef = useRef(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isFlashAvailable, setIsFlashAvailable] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [cameraList, setCameraList] = useState<QrScanner.Camera[]>();
  const [processedAttendeeIds, setProcessedAttendeeIds] = useState<string[]>(
    [],
  );
  const latestProcessedAttendeeIdsRef = useRef<string[]>([]);

  const [currentAttendeeId, setCurrentAttendeeId] = useState<string | null>(
    null,
  );
  const [debouncedAttendeeId] = useDebouncedValue(currentAttendeeId, 100);
  const [isScanFailed, setIsScanFailed] = useState(false);
  const [isScanSucceeded, setIsScanSucceeded] = useState(false);
  const [isCheckOutMode, setIsCheckOutMode] = useState(false);

  const scanSuccessAudioRef = useRef<HTMLAudioElement | null>(null);
  const scanErrorAudioRef = useRef<HTMLAudioElement | null>(null);
  const scanInProgressAudioRef = useRef<HTMLAudioElement | null>(null);

  const [isSoundOn, setIsSoundOn] = useState(() => {
    const storedIsSoundOn = localStorage.getItem('qrScannerSoundOn');
    return storedIsSoundOn === null ? true : JSON.parse(storedIsSoundOn);
  });

  useEffect(() => {
    localStorage.setItem('qrScannerSoundOn', JSON.stringify(isSoundOn));
  }, [isSoundOn]);

  // Remove processed IDs after a delay to allow rescanning
  const removeProcessedId = (id: string) => {
    setTimeout(() => {
      setProcessedAttendeeIds((prev) => prev.filter((prevId) => prevId !== id));
    }, 2000); // Allow rescanning after 2 seconds
  };

  useEffect(() => {
    latestProcessedAttendeeIdsRef.current = processedAttendeeIds;
  }, [processedAttendeeIds]);

  const startScanner = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setPermissionGranted(true);
      if (videoRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            if (!isProcessingRef.current) {
              setCurrentAttendeeId(result.data);
            }
          },
          {
            maxScansPerSecond: 3,
            highlightScanRegion: true,
          },
        );
        qrScannerRef.current.start();
      }
    } catch (error) {
      setPermissionDenied(true);
      console.error(error);
    }
  };

  // Reset scan state after animation completes
  useEffect(() => {
    if (isScanSucceeded || isScanFailed) {
      const timer = setTimeout(() => {
        setCurrentAttendeeId(null);
        setIsScanSucceeded(false);
        setIsScanFailed(false);
        setIsCheckingIn(false);
        isProcessingRef.current = false;
      }, 1000); // Animation cooldown time
      return () => clearTimeout(timer);
    }
  }, [isScanSucceeded, isScanFailed]);

  useEffect(() => {
    const processAttendeeId = async () => {
      // Clear scan states when no attendee ID
      if (!debouncedAttendeeId) {
        setIsCheckingIn(false);
        setIsScanSucceeded(false);
        setIsScanFailed(false);
        return;
      }

      // Don't process if already handling a scan
      if (
        isProcessingRef.current ||
        isScanSucceeded ||
        isScanFailed ||
        isCheckingIn
      ) {
        return;
      }

      // Don't process if this ID was recently processed
      if (latestProcessedAttendeeIdsRef.current.includes(debouncedAttendeeId)) {
        return;
      }

      isProcessingRef.current = true;
      console.log('Processing scan:', {
        attendeeId: debouncedAttendeeId,
        mode: isCheckOutMode ? 'checkout' : 'checkin',
      });

      setIsCheckingIn(true);

      try {
        if (isSoundOn && scanInProgressAudioRef.current) {
          await scanInProgressAudioRef.current.play().catch(() => {});
        }

        // Call the appropriate handler based on mode
        const handler = isCheckOutMode ? onCheckOut : onCheckIn;
        if (!handler) {
          throw new Error(t`Operation not supported`);
        }

        await new Promise<void>((resolve, reject) => {
          handler(
            debouncedAttendeeId,
            (success) => {
              if (success) {
                setIsScanSucceeded(true);
                if (isSoundOn && scanSuccessAudioRef.current) {
                  scanSuccessAudioRef.current.play().catch(() => {});
                }
                // Add to processed IDs to prevent duplicate scans
                setProcessedAttendeeIds((prev) => [
                  ...prev,
                  debouncedAttendeeId,
                ]);
                removeProcessedId(debouncedAttendeeId);
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
      } catch (error) {
        console.error('Scan processing error:', error);
        setIsScanFailed(true);
        if (isSoundOn && scanErrorAudioRef.current) {
          scanErrorAudioRef.current.play().catch(() => {});
        }
      } finally {
        setIsCheckingIn(false);
        isProcessingRef.current = false;
      }
    };

    processAttendeeId();
  }, [
    debouncedAttendeeId,
    attendees,
    isCheckOutMode,
    isSoundOn,
    onCheckIn,
    onCheckOut,
    t,
  ]);

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  const handleFlashToggle = () => {
    if (!isFlashAvailable) {
      showError(t`Flash is not available on this device`);
      return;
    }
    if (qrScannerRef.current) {
      if (isFlashOn) {
        qrScannerRef.current.turnFlashOff();
      } else {
        qrScannerRef.current.turnFlashOn();
      }
      setIsFlashOn(!isFlashOn);
    }
  };

  const resetScannerState = () => {
    setCurrentAttendeeId(null);
    setIsScanSucceeded(false);
    setIsScanFailed(false);
    setIsCheckingIn(false);
    isProcessingRef.current = false;
  };

  const handleModeToggle = () => {
    // Reset all states when changing modes
    setIsCheckOutMode(!isCheckOutMode);
    resetScannerState();
    // Re-initialize scanner
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
      startScanner();
    }
  };

  const handleSoundToggle = () => {
    setIsSoundOn(!isSoundOn);
  };

  const requestPermission = async () => {
    setPermissionDenied(false);
    await startScanner();
  };

  const updateFlashAvailability = async () => {
    if (qrScannerRef.current) {
      const hasFlash = await qrScannerRef.current.hasFlash();
      setIsFlashAvailable(hasFlash);
    }
  };

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        await startScanner();
        await updateFlashAvailability();
        const cameras = await QrScanner.listCameras(true);
        setCameraList(cameras);
      } catch (error) {
        console.error('Failed to initialize scanner:', error);
      }
    };

    initializeScanner();

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
    };
  }, []);

  const handleCameraSelection = (camera: QrScanner.Camera) => () => {
    return qrScannerRef.current
      ?.setCamera(camera.id)
      .then(() => updateFlashAvailability().catch(console.error));
  };

  return (
    <div className={classes.videoContainer}>
      {permissionDenied && (
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
      )}

      <video className={classes.video} ref={videoRef}></video>

      <Button
        onClick={handleFlashToggle}
        variant={'transparent'}
        className={classes.flashToggle}
      >
        {!isFlashAvailable && <IconBulbOff color={'#ffffff95'} size={30} />}
        {isFlashAvailable && (
          <IconBulb color={isFlashOn ? 'yellow' : '#ffffff95'} size={30} />
        )}
      </Button>
      <Button
        onClick={handleSoundToggle}
        variant={'transparent'}
        className={classes.soundToggle}
      >
        {isSoundOn && <IconVolume color={'#ffffff95'} size={30} />}
        {!isSoundOn && <IconVolumeOff color={'#ffffff95'} size={30} />}
      </Button>
      <Button
        onClick={handleModeToggle}
        variant={'filled'}
        className={classes.modeToggle}
        color={isCheckOutMode ? 'red' : 'green'}
      >
        {isCheckOutMode ? t`Check Out Mode` : t`Check In Mode`}
      </Button>
      <audio ref={scanSuccessAudioRef} src="/sounds/scan-success.wav" />
      <audio ref={scanErrorAudioRef} src="/sounds/scan-error.wav" />
      <audio ref={scanInProgressAudioRef} src="/sounds/scan-in-progress.wav" />
      <Button
        onClick={handleClose}
        variant={'transparent'}
        className={classes.closeButton}
      >
        <IconX color={'#ffffff95'} size={30} />
      </Button>
      <Button variant={'transparent'} className={classes.switchCameraButton}>
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <IconCameraRotate color={'#ffffff95'} size={30} />
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>{t`Select Camera`}</Menu.Label>
            {cameraList?.map((camera, index) => (
              <Menu.Item key={index} onClick={handleCameraSelection(camera)}>
                {camera.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </Button>
      <div
        className={`${classes.scannerOverlay} ${
          isScanSucceeded ? classes.success : ''
        } ${isScanFailed ? classes.failure : ''} ${
          isCheckingIn ? classes.checkingIn : ''
        } ${isCheckOutMode ? classes.checkOut : classes.checkIn}`}
      >
        <div className={classes.modeIndicator}>
          {isCheckOutMode ? t`Check Out Mode` : t`Check In Mode`}
        </div>
      </div>
    </div>
  );
};
