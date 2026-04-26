import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 px-6 py-10">
      <section className="mx-auto flex min-h-[85vh] max-w-6xl items-center">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              AI Fitness & Nutrition Coach
            </p>

            <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900 md:text-6xl">
              Train smarter with{" "}
              <span className="text-blue-600">TrainWise</span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              Create your profile, set your fitness goal, and get personalized
              workout and nutrition guidance powered by AI.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/auth?mode=register"
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow hover:bg-blue-700"
              >
                Get Started
              </Link>

              <Link
                href="/auth?mode=login"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900">
              Your personal fitness dashboard
            </h2>

            <div className="mt-6 space-y-4">
              <Feature
                title="Profile setup"
                text="Add your name, age, weight, height, goal, diet preference, equipment, and training days."
              />

              <Feature
                title="AI fitness chat"
                text="Ask TrainWise about workouts, meals, fat loss, muscle gain, recovery, and healthy habits."
              />

              <Feature
                title="Workout plans"
                text="Generate training plans based on your goal, equipment, and weekly schedule."
              />

              <Feature
                title="Nutrition plans"
                text="Get nutrition guidance based on your body metrics, activity level, and fitness goal."
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}