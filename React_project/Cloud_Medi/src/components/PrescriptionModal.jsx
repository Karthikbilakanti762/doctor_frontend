import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus, Mic, Save } from "lucide-react";
import { toast } from "react-hot-toast";

const PrescriptionModal = ({
  isOpen,
  visitId,
  onClose,
  onSaved,
  existingPrescription = [],
  triggerMic,
}) => {
  const [medications, setMedications] = useState([
    { name: "", dosage: "", duration: "", instructions: "" },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (existingPrescription && existingPrescription.length > 0) {
        const formatted = existingPrescription.map((med) => ({
          name: med.name || "",
          dosage: med.dosage || "",
          duration: med.duration || "",
          instructions: med.instructions || "",
        }));
        setMedications(formatted);
      } else {
        setMedications([
          { name: "", dosage: "", duration: "", instructions: "" },
        ]);
      }

      if (triggerMic) {
        handleGlobalSpeech();
      }
    }
  }, [isOpen, existingPrescription, triggerMic]);

  const handleChange = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      { name: "", dosage: "", duration: "", instructions: "" },
    ]);
  };

  const removeMedication = (index) => {
    const updated = [...medications];
    updated.splice(index, 1);
    setMedications(updated);
  };

  const handleSave = async () => {
    try {
      setIsProcessing(true);
      const res = await fetch(
        `http://localhost:5000/api/visits/${visitId}/prescription`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ medicines: medications }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Prescription saved successfully");
        onSaved && onSaved(data);
        onClose();
      } else {
        throw new Error(data.message || "Failed to save");
      }
    } catch (err) {
      console.error("Failed to save prescription:", err);
      toast.error("Unable to save prescription. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Speech recognition logic
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const handleGlobalSpeech = async () => {
    if (!SpeechRecognition) {
      toast("Speech recognition is not supported in your browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    setIsListening(true);
    toast.success("Listening for prescription...");

    recognition.onresult = async (event) => {
      const rawText = event.results[0][0].transcript;
      console.log("Voice input received:", rawText);
      setIsListening(false);
      toast.success("Processing voice input...");

      try {
        const gptRes = await fetch("/api/parse-prescription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prescription: rawText }),
        });

        if (!gptRes.ok) {
          throw new Error(`API error: ${gptRes.status}`);
        }

        const result = await gptRes.json();

        const parsedMeds = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
          ? result
          : null;

        if (parsedMeds && parsedMeds.length > 0) {
          setMedications((prev) => [...prev, ...parsedMeds]);
          toast.success(`Added ${parsedMeds.length} medication(s) from voice input`);
        } else {
          console.error("Unexpected response format:", result);
          toast.error("Could not parse the prescription from voice input");
        }
      } catch (err) {
        console.error("Parsing Error:", err);
        toast.error("Failed to process voice input");
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      toast.error("Speech recognition error occurred");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm z-50 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500/90 to-teal-600/90 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Prescription Details</h2>
          
          <button
            onClick={onClose}
            className="text-white hover:text-red-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          

          {/* Medications */}
          <div className="space-y-4">
            {medications.map((med, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-5 shadow-md border border-gray-200 hover:border-blue-300 transition-all duration-200"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">
                    Medication #{index + 1}
                  </h3>
                  <button
                    onClick={() => removeMedication(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100"
                    aria-label="Remove medication"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Medicine Name
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter medicine name"
                      value={med.name}
                      onChange={(e) => handleChange(index, "name", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Dosage
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g., 500mg twice daily"
                      value={med.dosage}
                      onChange={(e) => handleChange(index, "dosage", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Duration
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="e.g., 7 days"
                      value={med.duration}
                      onChange={(e) => handleChange(index, "duration", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Instructions
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] transition-colors"
                      placeholder="Special instructions or notes"
                      value={med.instructions}
                      onChange={(e) => handleChange(index, "instructions", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add More Button */}
          <Button
            variant="outline"
            className="mt-4 w-full flex items-center justify-center gap-2 border border-dashed border-blue-400 text-blue-600 hover:bg-blue-50 rounded-lg py-3"
            onClick={addMedication}
          >
            <Plus size={16} />
            Add Another Medication
          </Button>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <Button
              className="flex items-center justify-end gap-2 text-blue-600 border border-blue-300 hover:bg-blue-50 rounded-full px-4 py-2"
              onClick={handleGlobalSpeech}
              disabled={isListening}
            >
              <Mic size={16} className={isListening ? "animate-pulse text-red-500" : ""} />
              {isListening ? "Listening..." : "Voice Input"}
            </Button>
          <Button
            variant="outline"
            className="px-5 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm disabled:opacity-70"
            onClick={handleSave}
            disabled={isProcessing}
          >
            {isProcessing ? "Saving..." : "Save Prescription"}
            {!isProcessing && <Save size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionModal;