import Button from './Button.jsx';
import Modal from './Modal.jsx';

export default function ConfirmDialog({
  open, onClose, onConfirm, loading,
  title = 'مطمئن هستید؟', description, confirmText = 'تأیید', cancelText = 'انصراف', danger = true,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      footer={(
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>{cancelText}</Button>
          <Button variant={danger ? 'danger' : 'primary'} size="sm" loading={loading} onClick={onConfirm}>{confirmText}</Button>
        </>
      )}
    >
      <p className="text-sm leading-7 text-ink-500">{description || 'این عملیات قابل بازگشت نیست.'}</p>
    </Modal>
  );
}
