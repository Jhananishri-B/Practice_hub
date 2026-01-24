import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';

const PreviewFrame = forwardRef(({ code, isRestricted = false }, ref) => {
    const iframeRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);

    // Generate the HTML content for the iframe
    const generatePreviewContent = (codeObj) => {
        const { html = '', css = '', js = '' } = codeObj || {};

        return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    try {
      ${js}
    } catch (e) {
      console.error('Preview JS Error:', e);
    }
  </script>
</body>
</html>`;
    };

    // Update preview when code changes
    useEffect(() => {
        if (iframeRef.current && code) {
            const content = generatePreviewContent(code);
            const iframe = iframeRef.current;

            // Use srcdoc for cleaner content injection
            iframe.srcdoc = content;
            setIsLoading(false);
        }
    }, [code]);

    // Expose updatePreview method via ref
    useImperativeHandle(ref, () => ({
        updatePreview: (newCode) => {
            if (iframeRef.current) {
                const content = generatePreviewContent(newCode);
                iframeRef.current.srcdoc = content;
            }
        }
    }));

    return (
        <div className="relative w-full h-full bg-white">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <div className="text-gray-400 text-sm">Loading preview...</div>
                </div>
            )}
            <iframe
                ref={iframeRef}
                title="Code Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
                style={{
                    pointerEvents: isRestricted ? 'none' : 'auto',
                    userSelect: isRestricted ? 'none' : 'auto'
                }}
            />
        </div>
    );
});

PreviewFrame.displayName = 'PreviewFrame';

export default PreviewFrame;
