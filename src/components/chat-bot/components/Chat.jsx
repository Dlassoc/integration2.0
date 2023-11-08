import { useEffect, useState, useRef } from "react";
import Message from "./Message";
import Menu from "./Menu";
import SendIcon from "./SendIcon";
import ExitIcon from "./ExitIcon";
import useMessage from "../../../hooks/useMessages";

// Definición de las palabras clave para identificar el tipo de pregunta
const options = {
  password: [
    "change",
    "password",
    "key",
    "login",
    "issue",
    "want",
  ],
  pqr: [
    "issue",
    "pqr",
    "change",
    "no",
    "not working",
    "error",
    "want",
    "complaint",
    "unsatisfied",
  ],
  tournament: ["tournament", "issue", "login", "person", "participant"],
};

// Función para determinar el tipo de pregunta en función de las palabras clave
const giveAnAnswer = (message) => {
  let answers = message.toLowerCase().split(" ");

  let bestOne = "";
  let counter = 0;
  for (let key in options) {
    let tempCounter = 0;
    for (let answer of answers) {
      if (options[key].includes(answer)) {
        tempCounter++;
      }
    }
    if (tempCounter > counter) {
      counter = tempCounter;
      bestOne = key;
    }
  }

  if (counter < 3) {
    if (answers.includes("password") || answers.includes("key"))
      return "password";
    if (
      answers.includes("pqr") ||
      answers.includes("complaint") ||
      answers.includes("unsatisfied")
    )
      return "pqr";
    if (answers.includes("tournament")) return "tournament";
    if (answers.length === 1) {
      if (answers[0] === "yes") return "yes";
      if (answers[0] === "no") return "no";
      return "no_sense";
    }
    bestOne = "no_sense";
  }
  return bestOne;
};

// Respuestas posibles en función del tipo de pregunta
const PROCESS = {
  password: ["¿Quieres cambiar tu contraseña?", "Ingresa tu nueva contraseña"],
  pqr: ["¿Quieres hacer una PQR para presentar tu problema?", "Ingresa la PQR"],
  tournament: ["Iniciar un torneo", "Comenzar el torneo"],
  no_sense: ["No entiendo"],
  no: ["Está bien, estoy aquí para ayudarte con lo que necesites"],
  yes: ["Dime"],
};

// Funciones de manejo para procesos específicos
const HANDLE_PROCESS = {
  pqr: (message) => alert("Has presentado una PQR: " + message),
  password: (message) => alert("Nueva contraseña: " + message),
  tournament: (message) => alert("Torneo: " + message),
};

// Función para controlar el desplazamiento automático de los mensajes
function controlMessages() {
  const chat = document.getElementById("chat");
  if (!chat) return;
  chat.scrollTop = chat.scrollHeight;
  const chatLastChild = chat.lastChild;
  if (!chatLastChild) return;
  chatLastChild.classList.add("new-message");
  setTimeout(() => {
    chatLastChild.classList.remove("new-message");
  }, 1000);
}

// Función para determinar la respuesta del bot y manejar los procesos
async function checkQuestion(
  message,
  setAnswer,
  currentProcess,
  setCurrentProcess,
  isAnswering,
  setIsAnswering
) {
  const messageObject = {
    type: "bot",
    text: "",
  };

  if (isAnswering) {
    HANDLE_PROCESS[currentProcess](message);
    setIsAnswering(false);
    setCurrentProcess(undefined);
    messageObject.text = "¿Hay algo más en lo que pueda ayudarte?";
    return setAnswer((lastMessages) => [...lastMessages, messageObject]);
  }

  const response = giveAnAnswer(message);

  const process = PROCESS[response] ?? response;

  messageObject.text = process[0];

  if (currentProcess) {
    if (process === "yes") {
      messageObject.text = PROCESS[currentProcess][1];
      setIsAnswering(true);
    } else {
      messageObject.text = "Entonces, cuéntame cómo puedo ayudarte";
      setCurrentProcess(undefined);
    }
    return setAnswer((lastMessages) => [...lastMessages, messageObject]);
  }

  if (response !== "no" && response !== "yes") {
    setCurrentProcess(response);
  }

  return setAnswer((lastMessages) => [...lastMessages, messageObject]);
}

const Chat = () => {
  const [messages, setMessages] = useState([]);

  const newMessage = useRef();

  const { currentProcess, setCurrentProcess, isAnswering, setIsAnswering } =
    useMessage();

  useEffect(() => {
    controlMessages();
    const lastMessage = messages[messages.length - 1];
    if (messages.length === 0 || lastMessage?.type !== "user") return () => {};
    checkQuestion(
      lastMessage?.text,
      setMessages,
      currentProcess,
      setCurrentProcess,
      isAnswering,
      setIsAnswering
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const handleSubmit = () => {
    const value = newMessage.current.value;
    const array = value
      .split(" ")
      .filter((word) => word !== "")
      .join(" ");
    if (!array) return;

    const messageObject = {
      type: "user",
      text: value,
    };
    setMessages((lastMessages) => [...lastMessages, messageObject]);
    newMessage.current.value = "";
  };

  const handleExit = () => {
    const element = document.getElementById("card");
    if (!element.classList) return;
    element.classList.remove("show");
  };

  return (
    <article className="card-chat" id="card">
      <p className="title">Tu amigo</p>
      <ExitIcon click={handleExit} />
      <section className="chat" id="chat">
        <Menu />
        {messages != null &&
          messages.map((message) => (
            <Message key={crypto.randomUUID()} message={message} />
          ))}
      </section>
      <section className="send">
        <textarea
          ref={newMessage}
          onKeyDown={(e) => {
            if (e.which === 13 && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
              return;
            }
          }}
        ></textarea>
        <SendIcon click={handleSubmit} />
      </section>
    </article>
  );
};

export default Chat;
