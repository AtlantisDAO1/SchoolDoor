"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddSchoolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "India",
    phone: "",
    email: "",
    website: "",
    school_type: "",
    board: "",
    grade_levels: "",
    enrollment: "",
    student_teacher_ratio: "",
    medium_of_instruction: "",
    principal_name: "",
    established_year: "",
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/member/school-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name.trim(),
          address: formData.address.trim() || undefined,
          city: formData.city.trim() || undefined,
          state: formData.state.trim() || undefined,
          zip_code: formData.zip_code.trim() || undefined,
          country: formData.country || "India",
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          website: formData.website.trim() || undefined,
          school_type: formData.school_type.trim() || undefined,
          board: formData.board.trim() || undefined,
          grade_levels: formData.grade_levels.trim() || undefined,
          enrollment: formData.enrollment ? parseInt(formData.enrollment) : undefined,
          student_teacher_ratio: formData.student_teacher_ratio ? parseFloat(formData.student_teacher_ratio) : undefined,
          medium_of_instruction: formData.medium_of_instruction.trim() || undefined,
          principal_name: formData.principal_name.trim() || undefined,
          established_year: formData.established_year ? parseInt(formData.established_year) : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || data.error || "Failed to submit school request");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/member/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-8">
        <Link
          href="/reviews"
          className="inline-flex items-center gap-2 rounded-2xl border border-sd-navy/20 px-4 py-2 text-sm font-medium text-sd-navy transition hover:bg-sd-soft-blue/30 focus:outline-none focus:ring-2 focus:ring-sd-navy/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reviews
        </Link>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-surface-lg border border-sd-navy/10">
        <header className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sd-salmon">
            Submit School
          </p>
          <h1 className="mt-3 font-heading text-3xl text-sd-navy sm:text-4xl">
            Add a New School
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-sd-muted sm:text-base">
            Submit a school for review. Once approved by our admin team, it will be added to the platform.
          </p>
        </header>

        {success && (
          <div className="mb-6 rounded-3xl border border-green-200 bg-green-50 p-6 text-center">
            <p className="text-sm font-semibold text-green-800">
              ✓ School request submitted successfully! It will be reviewed by our admin team.
            </p>
            <p className="mt-2 text-xs text-green-600">
              Redirecting to dashboard...
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-3xl border border-sd-salmon/60 bg-sd-soft-pink/40 p-4 text-center">
            <p className="text-sm text-sd-salmon">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Required Fields */}
          <div className="rounded-2xl border border-sd-navy/15 bg-sd-soft-blue/20 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-sd-navy mb-4">
              Required Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-sd-muted mb-2">
                  School Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full rounded-xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40"
                  placeholder="Enter school name"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-sd-muted mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="w-full rounded-xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-sd-muted mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full rounded-xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40"
                    placeholder="State"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="rounded-2xl border border-sd-navy/15 bg-sd-soft-green/20 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-sd-navy mb-4">
              Additional Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-sd-muted mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40"
                  placeholder="School address"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-sd-muted mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-sd-muted mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40"
                    placeholder="school@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-sd-muted mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full rounded-xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40"
                  placeholder="https://www.schoolname.com"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-sd-muted mb-2">
                    Board (CBSE, ICSE, etc.)
                  </label>
                  <input
                    type="text"
                    value={formData.board}
                    onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                    className="w-full rounded-xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40"
                    placeholder="CBSE, ICSE, State Board, etc."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-sd-muted mb-2">
                    School Type
                  </label>
                  <input
                    type="text"
                    value={formData.school_type}
                    onChange={(e) => setFormData({ ...formData, school_type: e.target.value })}
                    className="w-full rounded-xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40"
                    placeholder="Public, Private, International, etc."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-sd-muted mb-2">
                    Medium of Instruction
                  </label>
                  <input
                    type="text"
                    value={formData.medium_of_instruction}
                    onChange={(e) => setFormData({ ...formData, medium_of_instruction: e.target.value })}
                    className="w-full rounded-xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40"
                    placeholder="English, Hindi, etc."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-sd-muted mb-2">
                    Principal Name
                  </label>
                  <input
                    type="text"
                    value={formData.principal_name}
                    onChange={(e) => setFormData({ ...formData, principal_name: e.target.value })}
                    className="w-full rounded-xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40"
                    placeholder="Principal name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-sd-muted mb-2">
                    Established Year
                  </label>
                  <input
                    type="number"
                    value={formData.established_year}
                    onChange={(e) => setFormData({ ...formData, established_year: e.target.value })}
                    min="1800"
                    max={new Date().getFullYear()}
                    className="w-full rounded-xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40"
                    placeholder="2020"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-sd-muted mb-2">
                    Enrollment
                  </label>
                  <input
                    type="number"
                    value={formData.enrollment}
                    onChange={(e) => setFormData({ ...formData, enrollment: e.target.value })}
                    min="0"
                    className="w-full rounded-xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40"
                    placeholder="Number of students"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-sd-muted mb-2">
                    Student:Teacher Ratio
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.student_teacher_ratio}
                    onChange={(e) => setFormData({ ...formData, student_teacher_ratio: e.target.value })}
                    min="0"
                    className="w-full rounded-xl border border-sd-navy/15 bg-white px-4 py-3 text-sm text-sd-ink outline-none transition focus:border-sd-navy/40"
                    placeholder="e.g., 20.0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6">
            <Link
              href="/reviews"
              className="inline-flex items-center rounded-2xl border border-sd-navy/20 px-4 py-2 text-sm font-medium text-sd-muted transition hover:text-sd-navy hover:bg-sd-soft-blue/30 focus:outline-none focus:ring-2 focus:ring-sd-navy/20"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || success}
              className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold shadow-surface-sm transition focus:outline-none focus:ring-2 focus:ring-sd-navy/20 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: 'linear-gradient(to right, #0f9790, #13b5ad)',
                color: '#ffffff',
                border: 'none'
              }}
            >
              <Save className="h-4 w-4" />
              {loading ? "Submitting..." : success ? "Submitted!" : "Submit School Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



