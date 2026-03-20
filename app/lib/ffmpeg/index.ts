type FFMessageLoadConfig = {
    coreURL?: string;
    wasmURL?: string;
    workerURL?: string;
    classWorkerURL?: string;
};

type FFMessageExecData = {
    args: string[];
    timeout?: number;
};

type FFMessageWriteFileData = {
    path: string;
    data: Uint8Array | string;
};

type FFMessageReadFileData = {
    path: string;
    encoding: "binary" | "utf8";
};

type FFMessageRenameData = {
    oldPath: string;
    newPath: string;
};

type FFMessageCreateDirData = {
    path: string;
};

type FFMessageListDirData = {
    path: string;
};

type FFMessageDeleteDirData = {
    path: string;
};

type FFMessageMountData = {
    fsType: string;
    options: Record<string, unknown>;
    mountPoint: string;
};

type FFMessageUnmountData = {
    mountPoint: string;
};

type FFMessageTypeValue =
    | "LOAD"
    | "EXEC"
    | "FFPROBE"
    | "WRITE_FILE"
    | "READ_FILE"
    | "DELETE_FILE"
    | "RENAME"
    | "CREATE_DIR"
    | "LIST_DIR"
    | "DELETE_DIR"
    | "ERROR"
    | "DOWNLOAD"
    | "PROGRESS"
    | "LOG"
    | "MOUNT"
    | "UNMOUNT";

type LogEvent = {
    type: string;
    message: string;
};

type ProgressEvent = {
    progress: number;
    time: number;
};

type CallbackData = Uint8Array | string | number | boolean | Error | Array<{ name: string; isDir: boolean }> | LogEvent | ProgressEvent | undefined;

const CORE_VERSION = "0.12.9";
const CORE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd/ffmpeg-core.js`;

const ERROR_NOT_LOADED = new Error("ffmpeg is not loaded, call `await ffmpeg.load()` first");
const ERROR_TERMINATED = new Error("called FFmpeg.terminate()");

const FFMessageType = {
    LOAD: "LOAD",
    EXEC: "EXEC",
    FFPROBE: "FFPROBE",
    WRITE_FILE: "WRITE_FILE",
    READ_FILE: "READ_FILE",
    DELETE_FILE: "DELETE_FILE",
    RENAME: "RENAME",
    CREATE_DIR: "CREATE_DIR",
    LIST_DIR: "LIST_DIR",
    DELETE_DIR: "DELETE_DIR",
    ERROR: "ERROR",
    DOWNLOAD: "DOWNLOAD",
    PROGRESS: "PROGRESS",
    LOG: "LOG",
    MOUNT: "MOUNT",
    UNMOUNT: "UNMOUNT",
} as const satisfies Record<string, FFMessageTypeValue>;

const getMessageID = (() => {
    let messageID = 0;
    return () => messageID++;
})();

export class FFmpeg {
    #worker: Worker | null = null;
    #resolves: Record<number, (data: CallbackData) => void> = {};
    #rejects: Record<number, (data: CallbackData) => void> = {};
    #logEventCallbacks: Array<(event: LogEvent) => void> = [];
    #progressEventCallbacks: Array<(event: ProgressEvent) => void> = [];
    loaded = false;

    #registerHandlers = () => {
        if (!this.#worker) return;

        this.#worker.onmessage = ({ data: { id, type, data } }) => {
            switch (type as FFMessageTypeValue) {
                case FFMessageType.LOAD:
                    this.loaded = true;
                    this.#resolves[id]?.(data);
                    break;
                case FFMessageType.MOUNT:
                case FFMessageType.UNMOUNT:
                case FFMessageType.EXEC:
                case FFMessageType.FFPROBE:
                case FFMessageType.WRITE_FILE:
                case FFMessageType.READ_FILE:
                case FFMessageType.DELETE_FILE:
                case FFMessageType.RENAME:
                case FFMessageType.CREATE_DIR:
                case FFMessageType.LIST_DIR:
                case FFMessageType.DELETE_DIR:
                    this.#resolves[id]?.(data);
                    break;
                case FFMessageType.LOG:
                    this.#logEventCallbacks.forEach((callback) => callback(data as LogEvent));
                    break;
                case FFMessageType.PROGRESS:
                    this.#progressEventCallbacks.forEach((callback) => callback(data as ProgressEvent));
                    break;
                case FFMessageType.ERROR:
                    this.#rejects[id]?.(data);
                    break;
            }

            delete this.#resolves[id];
            delete this.#rejects[id];
        };
    };

    #send = (
        { type, data }: { type: FFMessageTypeValue; data?: unknown },
        trans: Transferable[] = [],
        signal?: AbortSignal
    ) => {
        if (!this.#worker) {
            return Promise.reject(ERROR_NOT_LOADED);
        }

        return new Promise<CallbackData>((resolve, reject) => {
            const id = getMessageID();
            this.#resolves[id] = resolve;
            this.#rejects[id] = reject;
            this.#worker?.postMessage({ id, type, data }, trans);
            signal?.addEventListener(
                "abort",
                () => {
                    reject(new DOMException(`Message # ${id} was aborted`, "AbortError"));
                },
                { once: true }
            );
        });
    };

    on(event: "log", callback: (event: LogEvent) => void): void;
    on(event: "progress", callback: (event: ProgressEvent) => void): void;
    on(event: "log" | "progress", callback: ((event: LogEvent) => void) | ((event: ProgressEvent) => void)) {
        if (event === "log") {
            this.#logEventCallbacks.push(callback as (event: LogEvent) => void);
        } else {
            this.#progressEventCallbacks.push(callback as (event: ProgressEvent) => void);
        }
    }

    off(event: "log", callback: (event: LogEvent) => void): void;
    off(event: "progress", callback: (event: ProgressEvent) => void): void;
    off(event: "log" | "progress", callback: ((event: LogEvent) => void) | ((event: ProgressEvent) => void)) {
        if (event === "log") {
            this.#logEventCallbacks = this.#logEventCallbacks.filter((cb) => cb !== callback);
        } else {
            this.#progressEventCallbacks = this.#progressEventCallbacks.filter((cb) => cb !== callback);
        }
    }

    load = ({ classWorkerURL, ...config }: FFMessageLoadConfig = {}, { signal }: { signal?: AbortSignal } = {}) => {
        if (!this.#worker) {
            const workerURL = classWorkerURL ?? "./ffmpeg.worker.js";
            this.#worker = new Worker(new URL(workerURL, Object(import.meta).url), { type: "module" });
            this.#registerHandlers();
        }

        return this.#send(
            {
                type: FFMessageType.LOAD,
                data: config,
            },
            undefined,
            signal
        );
    };

    exec = (args: string[], timeout = -1, { signal }: { signal?: AbortSignal } = {}) =>
        this.#send(
            {
                type: FFMessageType.EXEC,
                data: { args, timeout } satisfies FFMessageExecData,
            },
            undefined,
            signal
        );

    ffprobe = (args: string[], timeout = -1, { signal }: { signal?: AbortSignal } = {}) =>
        this.#send(
            {
                type: FFMessageType.FFPROBE,
                data: { args, timeout } satisfies FFMessageExecData,
            },
            undefined,
            signal
        );

    terminate = () => {
        const ids = Object.keys(this.#rejects);
        for (const id of ids) {
            this.#rejects[Number(id)](ERROR_TERMINATED);
            delete this.#rejects[Number(id)];
            delete this.#resolves[Number(id)];
        }

        if (this.#worker) {
            this.#worker.terminate();
            this.#worker = null;
            this.loaded = false;
        }
    };

    writeFile = (path: string, data: Uint8Array | string, { signal }: { signal?: AbortSignal } = {}) => {
        const trans: Transferable[] = [];
        if (data instanceof Uint8Array) {
            trans.push(data.buffer);
        }

        return this.#send(
            {
                type: FFMessageType.WRITE_FILE,
                data: { path, data } satisfies FFMessageWriteFileData,
            },
            trans,
            signal
        );
    };

    mount = (fsType: string, options: Record<string, unknown>, mountPoint: string) =>
        this.#send(
            {
                type: FFMessageType.MOUNT,
                data: { fsType, options, mountPoint } satisfies FFMessageMountData,
            },
            []
        );

    unmount = (mountPoint: string) =>
        this.#send(
            {
                type: FFMessageType.UNMOUNT,
                data: { mountPoint } satisfies FFMessageUnmountData,
            },
            []
        );

    readFile = (path: string, encoding: "binary" | "utf8" = "binary", { signal }: { signal?: AbortSignal } = {}) =>
        this.#send(
            {
                type: FFMessageType.READ_FILE,
                data: { path, encoding } satisfies FFMessageReadFileData,
            },
            undefined,
            signal
        );

    deleteFile = (path: string, { signal }: { signal?: AbortSignal } = {}) =>
        this.#send(
            {
                type: FFMessageType.DELETE_FILE,
                data: { path },
            },
            [],
            signal
        );

    rename = (oldPath: string, newPath: string) =>
        this.#send(
            {
                type: FFMessageType.RENAME,
                data: { oldPath, newPath } satisfies FFMessageRenameData,
            },
            []
        );

    createDir = (path: string) =>
        this.#send(
            {
                type: FFMessageType.CREATE_DIR,
                data: { path } satisfies FFMessageCreateDirData,
            },
            []
        );

    listDir = (path: string) =>
        this.#send(
            {
                type: FFMessageType.LIST_DIR,
                data: { path } satisfies FFMessageListDirData,
            },
            []
        );

    deleteDir = (path: string) =>
        this.#send(
            {
                type: FFMessageType.DELETE_DIR,
                data: { path } satisfies FFMessageDeleteDirData,
            },
            []
        );
}

export default FFmpeg;
export { CORE_URL, FFMessageType, ERROR_NOT_LOADED };
