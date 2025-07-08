import { toast as hotToast, ToastPosition } from "react-hot-toast";

interface ToastOptions {
  position?: ToastPosition;
  duration?: number;
  toastId?: string;
}

interface ToastContent {
  message: string | React.ReactNode;
  icon?: React.ReactNode;
}

const defaultOptions: ToastOptions = {
  position: "top-center",
  duration: 2000,
};

const typeStyles = {
  success: {
    icon: <i className="ri-checkbox-circle-fill text-success text-[18px]" />,
  },
  error: {
    icon: <i className="ri-close-circle-fill text-error text-[18px]" />,
  },
  warn: {
    icon: <i className="ri-error-warning-fill text-warning text-[18px]" />,
  },
  loading: {
    icon: <i className="ri-loader-4-line text-primary animate-spin text-[18px]" />,
  },
};

function SimpleToast({
  t,
  content,
  type = "success",
  showClose = true,
}: {
  t: { id: string | number };
  content: ToastContent | string;
  type?: keyof typeof typeStyles;
  showClose?: boolean;
}) {
  const { message, icon } =
    typeof content === "string"
      ? { message: content, icon: typeStyles[type].icon }
      : { ...content, icon: content.icon ?? typeStyles[type].icon };
  return (
    <div
      className={
        "pointer-events-auto flex items-center p-[16px] h-[52px] gap-[16px] rounded-[8px] sm:rounded-[4px] shadow-lg border bg-background border-border min-w-[220px] max-w-[360px]"
      }
    >
      <div className="flex items-center gap-[8px] flex-1">
        <div className="flex items-center justify-center w-[20px] h-[20px]">{icon}</div>
        <div className="text-[14px] leading-[20px] font-normal text-primary">{message}</div>
      </div>
      {showClose && (
        <button
          onClick={() => hotToast.dismiss(String(t.id))}
          className="w-[24px] h-[24px] border border-transparent rounded-[4px] p-3 flex items-center justify-center text-sm font-medium"
        >
          <i className="ri-close-line text-base text-primary" />
        </button>
      )}
    </div>
  );
}

const Toast = {
  success: (content: ToastContent | string, options: ToastOptions = defaultOptions) =>
    hotToast.custom((t) => <SimpleToast t={t} content={content} type="success" />, options),
  error: (content: ToastContent | string, options: ToastOptions = defaultOptions) =>
    hotToast.custom((t) => <SimpleToast t={t} content={content} type="error" />, options),
  warn: (content: ToastContent | string, options: ToastOptions = defaultOptions) =>
    hotToast.custom((t) => <SimpleToast t={t} content={content} type="warn" />, options),
  loading: (content: ToastContent | string, options: ToastOptions = defaultOptions) =>
    hotToast.custom((t) => <SimpleToast t={t} content={content} type="loading" showClose={false} />, options),
};

export default Toast;
