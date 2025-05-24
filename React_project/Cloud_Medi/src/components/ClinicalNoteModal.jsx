import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Mic, Save, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

const ClinicalNoteModal = ({ isOpen, onClose, patientId, doctorId, visitId, onSaved, triggerMic }) => {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [fetchStatus, setFetchStatus] = useState({ state: "idle", message: "" });
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;
 
  useEffect(() => {
    if (!recognition) return;

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[event.resultIndex][0].transcript;
      setNotes((prev) => prev + " " + transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    if (triggerMic && isOpen) {
      try {
        recognition.start();
      } catch (error) {
        console.error("Speech recognition error:", error);
      }
    }

    return () => {
      if (isListening) {
        try {
          recognition.stop();
        } catch (error) {
          console.error("Error stopping recognition:", error);
        }
      }
    };
  }, [recognition, triggerMic, isOpen]);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        setFetchStatus({ state: "loading", message: "" });
        const res = await fetch(`/api/visits/${visitId}`);
        const data = await res.json();
        if (res.ok && data?.doctorNote) {
          if (typeof data.doctorNote === "object" && data.doctorNote.title && data.doctorNote.content) {
            setTitle(data.doctorNote.title);
            setNotes(data.doctorNote.content);
          } else {
            setNotes("");
            setTitle("Clinical Notes");
          }
          setFetchStatus({ state: "success", message: "" });
        } else {
          setTitle("");
          setNotes("");
          setFetchStatus({ state: "empty", message: "No existing notes found" });
        }
      } catch (err) {
        console.error("Error fetching note:", err);
        setFetchStatus({ state: "error", message: "Failed to load existing notes" });
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) fetchNote();
  }, [isOpen, visitId]);

  const handleNotesChange = (e) => setNotes(e.target.value);
  const handleMicClick = () => {
    if (!recognition) {
      toast.error("Speech recognition not supported in this browser.");
      return;
    }
    try {
      isListening ? recognition.stop() : recognition.start();
    } catch (err) {
      console.error(err);
      toast.error("Voice recognition error");
    }
  };

  const handleSave = async () => {
    if (!notes.trim()) {
      toast.error("Please enter notes before saving");
      return;
    }

    try {
      setLoading(true);

      const aiTitle = await generateTitle(notes);
      const finalTitle = aiTitle || "Clinical Notes " + new Date().toLocaleDateString();

      const res = await fetch(`/api/visits/${visitId}/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          doctorNote: {
            title: finalTitle,
            content: notes,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");

      toast.success("Clinical note saved successfully");

      if (onSaved) onSaved({ title: finalTitle, content: notes });

      onClose();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Could not save clinical note");
    } finally {
      setLoading(false);
    }
  };

  const generateTitle = async (content) => {
    if (content.length < 30) return "";
    try {
      const response = await axios.post("/api/clinical-notes/generate-title", { content });
      return response.data.title || "";
    } catch (error) {
      console.error("Title generation error:", error);
      return "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm z-50 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-500/90 to-teal-600/90 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Clinical Notes</h2>
          <button onClick={onClose} className="text-white hover:text-red-200 transition p-1 rounded-full hover:bg-white hover:bg-opacity-20">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {fetchStatus.state === "error" && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle size={16} />
              <span>{fetchStatus.message}</span>
            </div>
          )}

          <div className="mb-4">
            <div className="relative">
              <textarea
                id="clinical-notes"
                className="w-full min-h-[300px] px-4 py-3 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg resize-none transition-all duration-200"
                placeholder="Enter detailed clinical notes..."
                value={notes}
                onChange={handleNotesChange}
                disabled={loading}
              />
              <Button
                type="button"
                onClick={handleMicClick}
                className={`absolute bottom-3 right-3 p-2 rounded-full ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                } transition-all duration-200`}
                aria-label={isListening ? "Stop recording" : "Start voice recording"}
              >
                <Mic size={20} />
              </Button>
            </div>
            {isListening && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                Recording in progress... Speak clearly
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              {notes.length === 0 ? "No notes entered yet" : `${notes.length} characters`}
            </p>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-1">Tips:</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Press the mic to dictate notes</li>
              <li>• Title will be AI-generated after saving</li>
              <li>• Include symptoms, diagnosis, plan</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <Button onClick={onClose} variant="outline" className="px-5 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !notes.trim()} className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm disabled:opacity-70">
            {loading ? "Saving..." : "Save Notes"} {!loading && <Save size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClinicalNoteModal;
