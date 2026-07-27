import { toast } from "vue-sonner";

const DUR = { default: 4000, success: 3200, error: 5200 } as const;
type Opts = {
  description?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
  id?: string | number;
};

function show(tone: keyof typeof DUR, title: string, options: Opts = {}) {
  const method = tone === "default" ? toast : toast[tone];
  return method(title, {
    id: options.id,
    description: options.description,
    duration: options.duration ?? DUR[tone],
    action: options.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
  });
}

export const notify = {
  message: (title: string, options?: Opts) =>
    show("default", title, options),
  success: (title: string, options?: Opts) =>
    show("success", title, options),
  error: (title: string, options?: Opts) => show("error", title, options),
  dismiss: (id?: string | number) => toast.dismiss(id),
};
