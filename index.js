// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove, onChildRemoved, set ,onChildChanged} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAkOd0wXdvCf5sjydeQ7QV5YqHJqqLJrVM",
    authDomain: "notebook-real-time.firebaseapp.com",
    databaseURL: "https://notebook-real-time-default-rtdb.firebaseio.com",
    projectId: "notebook-real-time",
    storageBucket: "notebook-real-time.appspot.com",
    messagingSenderId: "430651019638",
    appId: "1:430651019638:web:41f24d8572da22b1902a57",
    measurementId: "G-V097CZENPT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const notesRef = ref(db, "notes");

// Đợi DOM tải xong trước khi gán sự kiện
document.addEventListener("DOMContentLoaded", () => {
    const addButton = document.querySelector("#add");

    // Hàm thêm ghi chú mới vào Firebase
    const addNewNote = (noteId, text = "") => {
        const note = document.createElement("div");
        note.classList.add("note");
        note.setAttribute("data-id", noteId);

        const htmlData = `
        <div class="operation">
            <button class="edit"> <i class="fas fa-edit"></i> </button>
            <button class="delete"> <i class="fas fa-trash-alt"></i> </button>
        </div>
        <div class="main ${text ? "" : "hidden"}"></div>
        <textarea class="${text ? "hidden" : ""}"></textarea>
        `;

        note.insertAdjacentHTML("afterbegin", htmlData);

        // Lấy tham chiếu các thành phần bên trong ghi chú
        const editButton = note.querySelector(".edit");
        const delButton = note.querySelector(".delete");
        const mainDiv = note.querySelector(".main");
        const textArea = note.querySelector("textarea");

        textArea.value = text;
        mainDiv.innerHTML = text;

        // Xử lý chỉnh sửa
        editButton.addEventListener("click", () => {
            mainDiv.classList.toggle("hidden");
            textArea.classList.toggle("hidden");
        });

        // Khi nhập dữ liệu, cập nhật Firebase
        textArea.addEventListener("input", (event) => {
            const value = event.target.value;
            mainDiv.innerHTML = value;
            set(ref(db, `notes/${noteId}`), value);
        });

        // Xóa ghi chú
        delButton.addEventListener("click", () => {
            remove(ref(db, `notes/${noteId}`));
        });

        document.body.appendChild(note);
    };

    // Lắng nghe Firebase
    onChildAdded(notesRef, (snapshot) => {
        if (snapshot.exists()) {
            addNewNote(snapshot.key, snapshot.val());
        }
    });
    onChildChanged(notesRef, (snapshot) => {
        const noteElement = document.querySelector(`[data-id='${snapshot.key}']`);
        if (noteElement) {
            const mainDiv = noteElement.querySelector(".main");
            const textArea = noteElement.querySelector("textarea");
    
            mainDiv.innerHTML = snapshot.val();
            textArea.value = snapshot.val();
        }
    });
    
    // Xóa ghi chú khỏi UI khi bị xóa trên Firebase
    onChildRemoved(notesRef, (snapshot) => {
        const noteToDelete = document.querySelector(`[data-id='${snapshot.key}']`);
        if (noteToDelete) {
            noteToDelete.remove();
        }
    });

    // Thêm ghi chú mới khi nhấn nút
    if (addButton) {
        addButton.addEventListener("click", () => {
            const newNoteRef = push(notesRef);
            set(newNoteRef, "");
        });
    }
});
