import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLocale } from "../hooks/useLocale";
import { LocaleSwitch } from "../reusableUI/LocaleSwitch";
import {
  PaperPanel,
  PaperPanelBody,
  PaperPanelHeader,
  PaperPanelTitle,
} from "../reusableUI/PaperPanel";

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const { copy, localizePath } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from ||
    localizePath("/admin/new-post");

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.login.failed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fanpage">
      <header className="masthead masthead--login">
        <LocaleSwitch />
      </header>
      <main className="fanpage__frame">
        <PaperPanel id="login" variant="cream" className="compose">
          <PaperPanelHeader>
            <p className="compose__eyebrow">{copy.login.eyebrow}</p>
            <PaperPanelTitle>{copy.login.title}</PaperPanelTitle>
            <p className="compose__hint">{copy.login.hint}</p>
          </PaperPanelHeader>

          <PaperPanelBody>
            <form className="compose-form" onSubmit={handleSubmit} noValidate>
              <div className="compose-form__field compose-form__field--title">
                <label htmlFor="username">{copy.login.username}</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </div>

              <div className="compose-form__field">
                <label htmlFor="password">{copy.login.password}</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <div className="compose-form__actions">
                {error ? (
                  <p className="compose-form__error" role="alert">
                    {error}
                  </p>
                ) : null}
                <button
                  className="btn btn--sticker"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? copy.login.submitting : copy.login.submit}
                </button>
              </div>
            </form>
          </PaperPanelBody>
        </PaperPanel>
      </main>
    </div>
  );
}
