import { useToast } from '../context/ToastContext';
const ICONS = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
export default function Toast() {
  const { toasts } = useToast();
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast-item toast-${t.type}`}>
          <i className={`fas ${ICONS[t.type] || ICONS.info}`}></i>
          {t.message}
        </div>
      ))}
    </div>
  );
}
