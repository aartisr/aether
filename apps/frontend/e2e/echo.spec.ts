import { expect, test } from '@playwright/test';

test.describe('Echo voice reflection flow', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'aether_page_flags',
        value: JSON.stringify({ enabled: ['echo'] }),
        url: 'http://127.0.0.1:3100',
      },
    ]);

    await context.grantPermissions(['microphone'], { origin: 'http://127.0.0.1:3100' });

    await page.addInitScript(() => {
      const mediaStream = {
        getTracks: () => [{ stop: () => undefined }],
      };

      type MockRecorderChunkHandler = ((event: { data: Blob }) => void) | null;
      type MockRecognitionResultHandler = ((event: {
        results: ArrayLike<{
          isFinal: boolean;
          length: number;
          0: { transcript: string; confidence: number };
        }>;
      }) => void) | null;
      type MockRecognitionErrorHandler = ((event: { error: string }) => void) | null;

      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: {
          getUserMedia: async () => mediaStream,
        },
      });

      class MockMediaRecorder {
        static isTypeSupported() {
          return true;
        }

        mimeType = 'audio/webm';
        ondataavailable: MockRecorderChunkHandler = null;
        onstop: (() => void) | null = null;

        constructor(_stream: MediaStream, _options?: { mimeType?: string }) {
          void _stream;
          void _options;
        }

        start() {
          return undefined;
        }

        stop() {
          const blob = new Blob(['audio-bytes'], { type: 'audio/webm' });
          this.ondataavailable?.({ data: blob });
          this.onstop?.();
        }
      }

      class MockSpeechRecognition {
        static async available() {
          return 'available' as const;
        }

        static async install() {
          return true;
        }

        continuous = false;
        interimResults = false;
        lang = 'en-US';
        processLocally = false;
        onresult: MockRecognitionResultHandler = null;
        onerror: MockRecognitionErrorHandler = null;
        onend: (() => void) | null = null;
        onstart: (() => void) | null = null;

        start() {
          window.setTimeout(() => {
            this.onresult?.({
              results: Object.assign(
                [{ isFinal: true, length: 1, 0: { transcript: 'I feel steady today', confidence: 0.9 } }],
                { length: 1 },
              ),
            });
          }, 150);
        }

        stop() {
          return undefined;
        }

        abort() {
          return undefined;
        }
      }

      window.MediaRecorder = MockMediaRecorder as unknown as typeof MediaRecorder;
      window.SpeechRecognition = MockSpeechRecognition as unknown as { new (): SpeechRecognition };
      window.webkitSpeechRecognition = undefined as unknown as { new (): SpeechRecognition };
      URL.createObjectURL = () => 'blob:mock-audio';
    });
  });

  test('records, populates transcript live, enables analysis before stop, and shows results', async ({ page }) => {
    await page.goto('/echo');

    await expect(page.getByRole('heading', { name: /how would you like to reflect/i })).toBeVisible();
    await expect(page.getByText(/never sends your voice or reflection to a server/i)).toBeVisible();

    await page.getByRole('button', { name: /start recording/i }).click();

    const recorderPad = page.getByRole('textbox', { name: /voice transcript/i });
    await expect(recorderPad).toBeVisible();
    await expect(recorderPad).toHaveValue('I feel steady today');
    await expect(page.getByRole('textbox', { name: /transcript for local analysis/i })).toHaveCount(0);

    await expect(page.getByText(/transcript ready\. you can analyze this check-in\./i)).toBeVisible();
    await expect(page.getByRole('button', { name: /notice a pattern/i })).toBeEnabled();
    await page.getByRole('button', { name: /notice a pattern/i }).click();

    await expect(page.getByTestId('sentiment-rail')).toBeVisible();
    await expect(page.getByText(/safety signal:/i)).toBeVisible();

    await page.getByRole('button', { name: /stop recording/i }).click();
    await expect(page.getByLabel(/playback recorded audio/i)).toBeVisible();
  });
});
