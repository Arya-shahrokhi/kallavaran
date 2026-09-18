import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiShield, FiUser } from 'react-icons/fi';
import Badge from '../../components/ui/Badge.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import { RowsSkeleton } from '../../components/ui/Skeleton.jsx';
import Seo from '../../components/common/Seo.jsx';
import { adminApi } from '../../services/endpoints.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDebounced } from '../../hooks/index.js';
import { faDate, toFa } from '../../utils/format.js';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [params] = useSearchParams();
  const [state, setState] = useState({ users: null, meta: null });
  const [search, setSearch] = useState(params.get('search') || '');
  const [page, setPage] = useState(1);
  const [pendingRole, setPendingRole] = useState(null);
  const term = useDebounced(search, 400);

  const load = () => {
    setState((s) => ({ ...s, users: null }));
    adminApi.users({ page, limit: 15, search: term || undefined })
      .then(({ data }) => setState({ users: data.users, meta: data.meta }))
      .catch(() => setState({ users: [], meta: null }));
  };
  useEffect(load, [page, term]);

  const update = async (id, payload, message) => {
    try {
      await adminApi.updateUser(id, payload);
      toast.success(message);
      load();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <>
      <Seo title="مدیریت کاربران" />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">کاربران</h1>
          {state.meta && <p className="num mt-1.5 text-sm text-ink-500">{toFa(state.meta.total)} کاربر</p>}
        </div>
      </div>

      <div className="relative mt-6 max-w-sm">
        <FiSearch className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400" size={17} />
        <input
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="نام، ایمیل یا موبایل" aria-label="جست‌وجوی کاربر" className="field bg-bone-50 pr-11"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border hairline bg-bone-50">
        {state.users === null ? (
          <div className="p-5"><RowsSkeleton rows={8} /></div>
        ) : state.users.length === 0 ? (
          <EmptyState icon={FiUser} title="کاربری پیدا نشد" description="عبارت جست‌وجو را تغییر دهید." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <thead className="bg-bone-100 text-2xs uppercase tracking-wide text-ink-400">
                <tr>{['کاربر', 'تماس', 'عضویت', 'نقش', 'وضعیت'].map((h) => <th key={h} className="px-4 py-3 text-right font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y hairline">
                {state.users.map((u) => (
                  <tr key={u._id} className="transition-colors hover:bg-moss-50/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-moss-100 text-xs font-bold text-moss-900">{u.name.charAt(0)}</span>
                        <span className="font-medium">{u.name}{u._id === me?._id && <span className="mr-1.5 text-2xs text-ink-400">(شما)</span>}</span>
                      </div>
                    </td>
                    <td className="num px-4 py-3 text-xs text-ink-500">{u.phone}<span className="block">{u.email}</span></td>
                    <td className="num px-4 py-3 text-xs text-ink-400">{faDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => u._id !== me?._id && setPendingRole(u)}
                        disabled={u._id === me?._id}
                        className="disabled:cursor-not-allowed"
                        aria-label="تغییر نقش"
                      >
                        <Badge tone={u.role === 'ADMIN' ? 'saffron' : 'neutral'}>
                          {u.role === 'ADMIN' ? <><FiShield size={11} /> مدیر</> : 'کاربر'}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => update(u._id, { isActive: !u.isActive }, u.isActive ? 'کاربر غیرفعال شد' : 'کاربر فعال شد')}
                        disabled={u._id === me?._id}
                        aria-label="تغییر وضعیت"
                        className="disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Badge tone={u.isActive ? 'moss' : 'berry'}>{u.isActive ? 'فعال' : 'غیرفعال'}</Badge>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={state.meta?.page || 1} pages={state.meta?.pages || 1} onChange={setPage} />

      <ConfirmDialog
        open={Boolean(pendingRole)}
        onClose={() => setPendingRole(null)}
        danger={pendingRole?.role === 'USER'}
        onConfirm={async () => {
          const nextRole = pendingRole.role === 'ADMIN' ? 'USER' : 'ADMIN';
          await update(pendingRole._id, { role: nextRole }, 'نقش کاربر تغییر کرد');
          setPendingRole(null);
        }}
        title="تغییر نقش کاربر"
        description={pendingRole?.role === 'ADMIN'
          ? `دسترسی مدیریت از «${pendingRole?.name}» گرفته می‌شود.`
          : `«${pendingRole?.name}» به تمام بخش‌های پنل مدیریت دسترسی پیدا می‌کند.`}
        confirmText="تغییر بده"
      />
    </>
  );
}
