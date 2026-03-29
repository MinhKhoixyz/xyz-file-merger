const { createApp, ref } = Vue;

// Atom: Base button
const AppButton = {
  template: `
        <button class="btn" :class="customClass" :disabled="disabled" @click="$emit('click')">
            <slot></slot>
        </button>
    `,
  props: ["disabled", "customClass"],
  emits: ["click"],
};

// Molecule: File item with remove button
const FileItem = {
  template: `
        <div class="file-item">
            <span>{{ file.name }}</span>
            <span class="remove-btn" @click="$emit('remove')">✖</span>
        </div>
    `,
  props: ["file"],
  emits: ["remove"],
};

// Organism: Naming modal
const AppModal = {
  template: `
        <div class="modal-overlay" v-if="show">
            <div class="modal">
                <h3>Name your output file</h3>
                <input type="text" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" @keyup.enter="$emit('confirm')" placeholder="e.g., merged_source_code">
                <div class="modal-actions">
                    <button class="btn btn-cancel" @click="$emit('close')">Cancel</button>
                    <button class="btn" @click="$emit('confirm')">Save .txt</button>
                </div>
            </div>
        </div>
    `,
  props: ["show", "modelValue"],
  emits: ["update:modelValue", "close", "confirm"],
};

// Template: Main app logic
const app = createApp({
  setup() {
    const files = ref([]);
    const showModal = ref(false);
    const outputFileName = ref("merged_code");

    const triggerFileInput = () => document.getElementById("fileInput").click();

    const handleFileUpload = (event) => {
      const selectedFiles = Array.from(event.target.files);
      files.value = [...files.value, ...selectedFiles];
      event.target.value = ""; // Reset input for re-uploading same files
    };

    const removeFile = (index) => files.value.splice(index, 1);

    const generateAndDownload = async () => {
      if (!outputFileName.value.trim()) {
        alert("Please enter a filename!");
        return;
      }

      let finalContent = "";

      for (const file of files.value) {
        const text = await file.text();
        // Append with separators
        finalContent += `--- Start of file: ${file.name} ---\n${text}\n--- End of file: ${file.name} ---\n\n`;
      }

      // Create and download file
      const blob = new Blob([finalContent], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${outputFileName.value}.txt`;
      link.click();

      URL.revokeObjectURL(url);
      showModal.value = false;
    };

    return {
      files,
      showModal,
      outputFileName,
      triggerFileInput,
      handleFileUpload,
      removeFile,
      generateAndDownload,
    };
  },
});

app.component("app-button", AppButton);
app.component("file-item", FileItem);
app.component("app-modal", AppModal);

app.mount("#app");
