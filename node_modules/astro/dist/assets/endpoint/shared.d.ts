import type { AstroRuntimeLogger } from '../../types/public/context.js';
export declare function loadRemoteImage(src: URL): Promise<Buffer | undefined>;
export declare const handleImageRequest: ({ request, loadLocalImage, logger, }: {
    request: Request;
    loadLocalImage: (src: string, baseUrl: URL) => Promise<Buffer | undefined>;
    logger: AstroRuntimeLogger;
}) => Promise<Response>;
