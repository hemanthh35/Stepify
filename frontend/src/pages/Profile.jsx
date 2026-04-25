import { useEffect, useMemo, useState } from 'react';
import { FaGithub, FaGlobe, FaLinkedin, FaMapMarkerAlt, FaQuoteLeft, FaTwitter } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth.js';

const MAX_AVATAR_SIZE_BYTES = 1024 * 1024;

function toFormState(user) {
  return {
    display_name: user?.display_name || '',
    headline: user?.headline || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    github_url: user?.github_url || '',
    linkedin_url: user?.linkedin_url || '',
    twitter_url: user?.twitter_url || '',
    avatar_url: user?.avatar_url || '',
  };
}

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState(() => toFormState(user));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(toFormState(user));
  }, [user]);

  const avatarPreview = form.avatar_url || '';
  const displayName = form.display_name || user?.email?.split('@')[0] || 'Stepify User';

  const initials = useMemo(() => {
    const value = displayName.trim();
    if (!value) return 'SU';
    const parts = value.split(/\s+/);
    return (parts[0]?.[0] || 'S') + (parts[1]?.[0] || 'U');
  }, [displayName]);

  const setField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  async function onAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setError('Image is too large. Please keep it under 1MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setError('');
      setForm((prev) => ({ ...prev, avatar_url: String(reader.result || '') }));
    };
    reader.readAsDataURL(file);
  }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await updateProfile(form);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Profile</h1>
        <p className="mt-2 text-sm text-gray-600">Build your public learning identity with a profile photo, headline, and social links.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
        <aside className="card h-fit">
          <div className="flex flex-col items-center text-center">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile" className="h-28 w-28 rounded-2xl object-cover shadow-sm" />
            ) : (
              <div className="inline-flex h-28 w-28 items-center justify-center rounded-2xl bg-violet-100 text-2xl font-semibold text-accent">
                {initials.toUpperCase()}
              </div>
            )}
            <h2 className="mt-4 text-xl font-semibold text-ink">{displayName}</h2>
            <p className="mt-1 text-sm text-gray-600">{form.headline || 'Add a headline to describe what you do.'}</p>
            <p className="mt-2 text-xs text-gray-500">{user?.email}</p>
          </div>

          <div className="mt-6 space-y-2 text-sm text-gray-700">
            {form.location ? (
              <p className="inline-flex items-center gap-2"><FaMapMarkerAlt className="text-gray-400" /> {form.location}</p>
            ) : null}
            {form.website ? (
              <p className="inline-flex items-center gap-2"><FaGlobe className="text-gray-400" /> {form.website}</p>
            ) : null}
            {form.github_url ? (
              <p className="inline-flex items-center gap-2"><FaGithub className="text-gray-400" /> GitHub</p>
            ) : null}
            {form.linkedin_url ? (
              <p className="inline-flex items-center gap-2"><FaLinkedin className="text-gray-400" /> LinkedIn</p>
            ) : null}
            {form.twitter_url ? (
              <p className="inline-flex items-center gap-2"><FaTwitter className="text-gray-400" /> X / Twitter</p>
            ) : null}
          </div>
        </aside>

        <section className="card">
          <form className="space-y-5" onSubmit={onSave}>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-ink" htmlFor="display_name">Display name</label>
                <input id="display_name" className="input mt-1" value={form.display_name} onChange={setField('display_name')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink" htmlFor="headline">Headline</label>
                <input id="headline" className="input mt-1" value={form.headline} onChange={setField('headline')} placeholder="AI learner | Data enthusiast" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink" htmlFor="bio">Bio</label>
              <textarea id="bio" className="input mt-1" rows={4} value={form.bio} onChange={setField('bio')} placeholder="Tell people what you are learning and building." />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-ink" htmlFor="location">Location</label>
                <input id="location" className="input mt-1" value={form.location} onChange={setField('location')} placeholder="City, Country" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink" htmlFor="website">Website</label>
                <input id="website" className="input mt-1" value={form.website} onChange={setField('website')} placeholder="https://example.com" />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-ink" htmlFor="github">GitHub</label>
                <input id="github" className="input mt-1" value={form.github_url} onChange={setField('github_url')} placeholder="https://github.com/username" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink" htmlFor="linkedin">LinkedIn</label>
                <input id="linkedin" className="input mt-1" value={form.linkedin_url} onChange={setField('linkedin_url')} placeholder="https://linkedin.com/in/username" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink" htmlFor="twitter">X / Twitter</label>
                <input id="twitter" className="input mt-1" value={form.twitter_url} onChange={setField('twitter_url')} placeholder="https://x.com/username" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink" htmlFor="avatar">Profile photo</label>
              <input id="avatar" type="file" accept="image/*" className="input mt-1" onChange={onAvatarChange} />
              <p className="mt-1 text-xs text-gray-500">PNG/JPG/WebP up to 1MB.</p>
            </div>

            {message ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
            {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

            <div className="flex items-center justify-between border-t border-line pt-4">
              <p className="inline-flex items-center gap-2 text-xs text-gray-500"><FaQuoteLeft /> Keep your profile clean and authentic.</p>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
