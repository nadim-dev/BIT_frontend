import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Eye,
  Headphones,
  Image,
  LoaderCircle,
  Send,
  User,
  X,
} from "lucide-react";
import getInitials from "../utils/getInitial";
import { formatTicketDate } from "../utils/dateCustomization";

const allowedReplyImageTypes = ["image/png", "image/jpg", "image/jpeg"];
const maxReplyImageSize = 5 * 1024 * 1024;

const messageVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const isAdminSender = (sender) => sender === "Admin" || sender === "admin";

const getSenderLabel = (item, user, adminName, isAdminView) => {
  if (isAdminSender(item.sender)) return adminName || "Support Team";
  if (isAdminView) return item.senderName || user?.username || user?.name || "User";
  return "You";
};

const AttachmentLink = ({ attachment, attachmentName }) =>
  attachment ? (
    <a
      href={attachment}
      target="_blank"
      rel="noreferrer"
      className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-blue-600 transition hover:border-blue-200 hover:bg-blue-50"
    >
      <Eye className="size-3.5" />
      {attachmentName || "View attachment"}
    </a>
  ) : null;

export function TicketConversation({
  messages = [],
  user,
  adminName = "Support Team",
  onSendMessage,
  isAdminView = false,
  emptyText = "No replies yet. Start helping the user by sending a response.",
}) {
  const [replyMessage, setReplyMessage] = useState("");
  const [replyImage, setReplyImage] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const imageInputRef = useRef(null);

  const validateReplyImage = (file) => {
    if (!allowedReplyImageTypes.includes(file.type)) {
      return "Only PNG, JPG, or JPEG images are supported.";
    }

    if (file.size > maxReplyImageSize) {
      return "Image size must be 5MB or less.";
    }

    return "";
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    const error = validateReplyImage(file);
    if (error) {
      setSendError(error);
      event.target.value = "";
      return;
    }

    setReplyImage(file);
    setSendError("");
  };

  const removeReplyImage = () => {
    setReplyImage(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const message = replyMessage.trim();

    if (!message && !replyImage) {
      setSendError("Message or image is required.");
      return;
    }

    try {
      setIsSending(true);
      setSendError("");
      await onSendMessage?.(message, replyImage);
      setReplyMessage("");
      removeReplyImage();
    } catch (err) {
      setSendError(err.message || "Unable to send reply.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="flex max-h-[760px] min-h-[560px] flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_20px_55px_rgba(15,23,42,0.06)]">
      <div className="border-b border-[#E5E7EB] px-5 py-4">
        <h2 className="text-base font-bold text-slate-950">Conversation</h2>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 p-5">
        {messages.length ? (
          messages.map((item, index) => {
            const adminMessage = isAdminSender(item.sender);
            const alignRight = isAdminView ? !adminMessage : !adminMessage;
            const senderLabel = getSenderLabel(item, user, adminName, isAdminView);
            const userInitials = getInitials(senderLabel);
            const userPicture = item.senderPicture || user?.picture;

            return (
              <motion.article
                key={item._id || `${item.sender}-${item.createdAt}-${index}`}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.24) }}
                className={`flex items-end gap-3 ${alignRight ? "justify-end" : "justify-start"}`}
              >
                {!alignRight ? (
                  <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-[#D90429] shadow-sm ring-1 ring-slate-200">
                    {adminMessage ? <Headphones className="size-5" /> : <User className="size-5" />}
                  </span>
                ) : null}

                <div
                  className={`max-w-[82%] rounded-2xl border px-4 py-3 shadow-sm sm:max-w-[70%] ${
                    adminMessage
                      ? "border-red-100 bg-red-50 text-slate-800"
                      : "border-blue-100 bg-blue-50 text-slate-800"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-950">{senderLabel}</p>
                    <span className="text-xs font-semibold text-slate-400">
                      {formatTicketDate(item.createdAt)}
                    </span>
                  </div>
                  {item.message ? (
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                      {item.message}
                    </p>
                  ) : null}
                  <AttachmentLink
                    attachment={item.attachment}
                    attachmentName={item.attachmentName}
                  />
                </div>

                {alignRight ? (
                  <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
                    {userPicture ? (
                      <img
                        src={userPicture}
                        alt={senderLabel}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-extrabold">{userInitials}</span>
                    )}
                  </span>
                ) : null}
              </motion.article>
            );
          })
        ) : (
          <div className="flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-5 text-center text-sm font-semibold leading-6 text-slate-500">
            {emptyText}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 border-t border-[#E5E7EB] bg-white p-4"
      >
        <textarea
          value={replyMessage}
          onChange={(event) => {
            setReplyMessage(event.target.value);
            if (sendError) setSendError("");
          }}
          rows="4"
          placeholder="Write your response..."
          className="w-full resize-none rounded-2xl border border-[#E5E7EB] bg-white p-4 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#D90429] focus:ring-4 focus:ring-red-100"
        />

        {sendError ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-600">
            <AlertCircle className="size-3.5" />
            {sendError}
          </p>
        ) : null}

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <input
              ref={imageInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpg,image/jpeg"
              className="sr-only"
              onChange={handleImageChange}
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Image className="size-4" />
              Attachment
            </button>

            {replyImage ? (
              <span className="inline-flex min-w-0 max-w-56 items-center gap-2 rounded-2xl border border-[#E5E7EB] px-3 py-2 text-xs font-bold text-slate-600">
                <Image className="size-3.5 shrink-0 text-blue-500" />
                <span className="truncate">{replyImage.name}</span>
                <button
                  type="button"
                  onClick={removeReplyImage}
                  className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  aria-label="Remove image"
                >
                  <X className="size-3.5" />
                </button>
              </span>
            ) : null}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#D90429] px-5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(217,4,41,0.24)] transition hover:bg-[#b80322] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
            {isSending ? "Sending..." : "Send Reply"}
          </motion.button>
        </div>
      </form>
    </section>
  );
}
