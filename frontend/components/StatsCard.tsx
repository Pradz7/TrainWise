type Props = {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
};

const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export default function StatsCard({
  weightKg,
  heightCm,
  age,
  sex,
  activityLevel,
}: Props) {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  const bmr =
    sex === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const tdee = bmr * activityMultipliers[activityLevel];

  const bmiLabel =
    bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Body Summary</h2>
        <p className="mt-2 text-slate-500">
          Quick health and energy metrics based on your current profile.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-slate-500">BMI</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{bmi.toFixed(1)}</p>
          <p className="mt-1 text-sm text-slate-600">{bmiLabel}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-slate-500">BMR</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{Math.round(bmr)}</p>
          <p className="mt-1 text-sm text-slate-600">calories/day</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-slate-500">TDEE</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{Math.round(tdee)}</p>
          <p className="mt-1 text-sm text-slate-600">maintenance calories/day</p>
        </div>
      </div>
    </section>
  );
}