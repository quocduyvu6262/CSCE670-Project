export type SourceUpdate = {
    url: string;
    domain: string;
    status: 'analyzing' | 'supports' | 'debunks' | 'neutral';
    verdict?: string; // Short reason
    quote?: string; // Relevant quote from the source
};

export type Message =
    | { type: 'TRIGGER_CHECK'; text: string }
    | { type: 'SOURCE_UPDATE'; payload: SourceUpdate }
    | { type: 'STREAM_START' }
    | { type: 'STREAM_CHUNK'; chunk: string }
    | { type: 'STREAM_END' }
    | { type: 'ERROR'; error: string };
