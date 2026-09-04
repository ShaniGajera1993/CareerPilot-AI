import axios from "axios";
import {
  Check,
  CheckCircle2,
  FileCheck2,
  FileText,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import api, { parseApiError } from "../../services/api";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ["pdf", "docx"];

type Resume = {
  id: number;
  name: string;
  extension: "pdf" | "docx";
  size_bytes: number;
  status: "uploaded";
  created_at: string;
};

type ResumeCollection = {
  data: Resume[];
  meta: { current_page: number; total: number };
};
type ResumeResponse = { data: Resume };

function formatFileSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUploadDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function validateResume(file: File): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!ACCEPTED_EXTENSIONS.includes(extension)) {
    return "Choose a PDF or DOCX resume.";
  }
  if (file.size === 0) {
    return "This file is empty. Choose a resume with content.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "This file is larger than 10 MB. Choose a smaller resume.";
  }

  return null;
}

export function ResumeWorkspace() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResumes, setTotalResumes] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadControllerRef = useRef<AbortController | null>(null);
  const uploadControllerRef = useRef<AbortController | null>(null);

  const loadResumes = useCallback(async (page = 1) => {
    loadControllerRef.current?.abort();
    const controller = new AbortController();
    loadControllerRef.current = controller;
    if (page === 1) {
      setIsLoading(true);
      setLoadError("");
    } else {
      setIsLoadingMore(true);
      setLoadMoreError("");
    }

    try {
      const response = await api.get<ResumeCollection>("/resumes", {
        signal: controller.signal,
        params: { page },
      });
      setResumes((current) => {
        if (page === 1) return response.data.data;

        const knownIds = new Set(current.map((resume) => resume.id));
        return [
          ...current,
          ...response.data.data.filter((resume) => !knownIds.has(resume.id)),
        ];
      });
      setCurrentPage(response.data.meta.current_page);
      setTotalResumes(response.data.meta.total);
    } catch (error) {
      if (!axios.isCancel(error)) {
        const message = parseApiError(
          error,
          "Your resumes could not be loaded.",
        ).message;
        if (page === 1) setLoadError(message);
        else setLoadMoreError(message);
      }
    } finally {
      if (!controller.signal.aborted) {
        if (page === 1) setIsLoading(false);
        else setIsLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => void loadResumes(), 0);

    return () => {
      window.clearTimeout(loadTimer);
      loadControllerRef.current?.abort();
      uploadControllerRef.current?.abort();
    };
  }, [loadResumes]);

  function chooseFile(file: File | undefined) {
    if (!file || isUploading) return;

    const validationError = validateResume(file);
    setSuccessMessage("");
    setUploadError(validationError ?? "");
    setSelectedFile(validationError ? null : file);
    setUploadProgress(null);
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    chooseFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragOver(false);
    chooseFile(event.dataTransfer.files?.[0]);
  }

  async function uploadResume() {
    if (!selectedFile || isUploading) return;

    const controller = new AbortController();
    uploadControllerRef.current = controller;
    const formData = new FormData();
    formData.append("resume", selectedFile);
    setIsUploading(true);
    setUploadError("");
    setSuccessMessage("");
    setUploadProgress(0);

    try {
      const response = await api.post<ResumeResponse>("/resumes", formData, {
        signal: controller.signal,
        timeout: 60_000,
        onUploadProgress: (event) => {
          setUploadProgress(
            event.total ? Math.round((event.loaded / event.total) * 100) : null,
          );
        },
      });

      setResumes((current) => [response.data.data, ...current]);
      setTotalResumes((current) => current + 1);
      setLoadError("");
      setLoadMoreError("");
      setSuccessMessage(`${response.data.data.name} is ready for analysis.`);
      setSelectedFile(null);
      setUploadProgress(null);
    } catch (error) {
      if (axios.isCancel(error)) {
        setUploadError("Upload cancelled. Your file is still selected.");
      } else {
        const failure = parseApiError(error, "Your resume could not be uploaded.");
        setUploadError(failure.fieldErrors.resume ?? failure.message);
      }
    } finally {
      setIsUploading(false);
      uploadControllerRef.current = null;
    }
  }

  function removeSelectedFile() {
    if (isUploading) return;
    setSelectedFile(null);
    setUploadError("");
    setUploadProgress(null);
  }

  return (
    <div className="resume-workspace">
      <section className="resume-intake">
        <div className="resume-intake-main">
          <div className="resume-intake-heading">
            <span><UploadCloud /></span>
            <div>
              <h2>Add your current resume</h2>
              <p>We’ll keep the original private and prepare it for analysis.</p>
            </div>
          </div>

          <button
            type="button"
            className={`resume-dropzone${isDragOver ? " is-dragging" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragOver(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            disabled={isUploading}
            aria-describedby="resume-upload-help resume-upload-error"
          >
            <UploadCloud aria-hidden="true" />
            <strong>Drop your resume here</strong>
            <span>or choose a file from your device</span>
            <small id="resume-upload-help">PDF or DOCX · 10 MB maximum</small>
          </button>
          <input
            ref={fileInputRef}
            className="resume-file-input"
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileInput}
            tabIndex={-1}
          />

          <div
            className={`resume-upload-feedback${uploadError ? " has-error" : ""}`}
            id="resume-upload-error"
            role={uploadError ? "alert" : "status"}
            aria-live="polite"
          >
            {uploadError || successMessage}
          </div>

          {selectedFile && (
            <div className="resume-file-queue">
              <span className="resume-file-icon">
                <FileText />
                <small>{selectedFile.name.split(".").pop()?.toUpperCase()}</small>
              </span>
              <div className="resume-file-details">
                <strong title={selectedFile.name}>{selectedFile.name}</strong>
                <span>{formatFileSize(selectedFile.size)} · Ready to upload</span>
                {isUploading && (
                  <div className="resume-progress-row">
                    <div
                      className={`resume-progress${uploadProgress === null ? " is-indeterminate" : ""}`}
                      role="progressbar"
                      aria-label={`Uploading ${selectedFile.name}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={uploadProgress ?? undefined}
                    >
                      <span
                        style={{
                          transform: `scaleX(${(uploadProgress ?? 38) / 100})`,
                        }}
                      />
                    </div>
                    <small>{uploadProgress === null ? "Uploading" : `${uploadProgress}%`}</small>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="resume-remove-file"
                onClick={removeSelectedFile}
                disabled={isUploading}
                aria-label={`Remove ${selectedFile.name}`}
                title="Remove file"
              >
                <X />
              </button>
            </div>
          )}

          <div className="resume-upload-actions">
            {isUploading && (
              <button
                type="button"
                className="resume-cancel-upload"
                onClick={() => uploadControllerRef.current?.abort()}
              >
                Cancel upload
              </button>
            )}
            <button
              type="button"
              className="resume-upload-button"
              onClick={uploadResume}
              disabled={!selectedFile || isUploading}
              aria-busy={isUploading}
            >
              {isUploading ? <LoaderCircle className="spin" /> : <UploadCloud />}
              <span>{isUploading ? "Uploading…" : "Upload resume"}</span>
            </button>
          </div>
        </div>

        <aside className="resume-next-steps" aria-labelledby="resume-next-title">
          <span className="resume-spark"><Sparkles /></span>
          <h2 id="resume-next-title">From file to career signal</h2>
          <p>Your upload starts a clear three-step resume workflow.</p>
          <ol>
            <li className={resumes.length > 0 ? "is-complete" : "is-current"}>
              <span>{resumes.length > 0 ? <Check /> : "1"}</span>
              <div><strong>Upload securely</strong><small>Your original stays private.</small></div>
            </li>
            <li>
              <span>2</span>
              <div><strong>Parse your experience</strong><small>Coming next in Phase 2.</small></div>
            </li>
            <li>
              <span>3</span>
              <div><strong>Improve with AI</strong><small>Scores and suggestions follow.</small></div>
            </li>
          </ol>
        </aside>
      </section>

      <section className="resume-library" aria-labelledby="resume-library-title">
        <header>
          <div>
            <h2 id="resume-library-title">Your resumes</h2>
            <p>Files you’ve uploaded to this workspace.</p>
          </div>
          {!isLoading && !loadError && (
            <span>{totalResumes} {totalResumes === 1 ? "file" : "files"}</span>
          )}
        </header>

        {isLoading ? (
          <div className="resume-library-state" aria-live="polite" aria-busy="true">
            <LoaderCircle className="spin" />
            <span>Loading your resumes…</span>
          </div>
        ) : loadError ? (
          <div className="resume-library-state has-error" role="alert">
            <span>{loadError}</span>
            <button type="button" onClick={() => void loadResumes()}>
              <RefreshCw /> Try again
            </button>
          </div>
        ) : resumes.length === 0 ? (
          <div className="resume-library-state is-empty">
            <FileCheck2 />
            <strong>No resumes yet</strong>
            <span>Your first uploaded resume will appear here.</span>
          </div>
        ) : (
          <ul className="resume-list">
            {resumes.map((resume) => (
              <li key={resume.id}>
                <span className="resume-file-icon">
                  <FileText />
                  <small>{resume.extension.toUpperCase()}</small>
                </span>
                <div>
                  <strong title={resume.name}>{resume.name}</strong>
                  <span>{formatFileSize(resume.size_bytes)} · Uploaded {formatUploadDate(resume.created_at)}</span>
                </div>
                <em><CheckCircle2 /> Ready for analysis</em>
              </li>
            ))}
            {(resumes.length < totalResumes || loadMoreError) && (
              <li className="resume-list-more">
                {loadMoreError && <span role="alert">{loadMoreError}</span>}
                {resumes.length < totalResumes && (
                  <button
                    type="button"
                    onClick={() => void loadResumes(currentPage + 1)}
                    disabled={isLoadingMore}
                    aria-busy={isLoadingMore}
                  >
                    {isLoadingMore ? <LoaderCircle className="spin" /> : null}
                    {isLoadingMore ? "Loading…" : "Load more resumes"}
                  </button>
                )}
              </li>
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
