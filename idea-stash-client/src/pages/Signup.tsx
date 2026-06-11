import { useRef, useState } from "react";
import { Button } from "../components/ui/Button";
import { InputBox } from "../components/ui/InputBox";
import { authApi } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../hooks/useToast";

export function Signup() {
  const usernameref = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    const username = usernameref.current?.value.trim();
    const password = passwordRef.current?.value;
    if (!username || !password) {
      toast("Please fill in all fields", "error");
      return;
    }

    setLoading(true);
    try {
      await authApi.signup(username, password);
      toast("Account created! Please sign in.", "success");
      navigate("/signin");
    } catch {
      toast("Signup failed — username may already exist", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            Idea Stash
          </h1>
          <p className="text-gray-600">Your second brain</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <InputBox placeholder="3–13 characters" ref={usernameref} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <InputBox placeholder="password" type="password" ref={passwordRef} />
            </div>
            <Button
              variant="primary"
              text={loading ? "Creating..." : "Create Account"}
              size="lg"
              fullWidth
              onClick={handleSignup}
            />
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/signin" className="text-purple-600 hover:text-purple-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
