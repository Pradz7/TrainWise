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

function getBmiStatus(bmi: number) {
  if (bmi < 18.5) {
    return {
      label: "Underweight",
      description: "Below healthy BMI range",
      recommendation: "Healthy weight gain",
      cardClass: "border-blue-200 bg-blue-50",
      badgeClass: "bg-blue-100 text-blue-700",
      recommendationClass: "bg-blue-100 text-blue-800",
    };
  }

  if (bmi < 25) {
    return {
      label: "Normal",
      description: "Healthy BMI range",
      recommendation: "Maintenance",
      cardClass: "border-green-200 bg-green-50",
      badgeClass: "bg-green-100 text-green-700",
      recommendationClass: "bg-green-100 text-green-800",
    };
  }

  if (bmi < 30) {
    return {
      label: "Overweight",
      description: "Above healthy BMI range",
      recommendation: "Fat loss",
      cardClass: "border-yellow-200 bg-yellow-50",
      badgeClass: "bg-yellow-100 text-yellow-700",
      recommendationClass: "bg-yellow-100 text-yellow-800",
    };
  }

  return {
    label: "Obesity",
    description: "High BMI range",
    recommendation: "Gradual fat loss",
    cardClass: "border-red-200 bg-red-50",
    badgeClass: "bg-red-100 text-red-700",
    recommendationClass: "bg-red-100 text-red-800",
  };
}

function getBmrStatus(bmr: number) {
  if (bmr < 1400) {
    return {
      label: "Lower baseline",
      description: "Lower resting energy needs",
      badgeClass: "bg-slate-200 text-slate-700",
    };
  }

  if (bmr < 1900) {
    return {
      label: "Moderate baseline",
      description: "Average resting energy needs",
      badgeClass: "bg-slate-200 text-slate-700",
    };
  }

  return {
    label: "Higher baseline",
    description: "Higher resting energy needs",
    badgeClass: "bg-slate-200 text-slate-700",
  };
}

function getTdeeStatus(tdee: number) {
  if (tdee < 2000) {
    return {
      label: "Lower maintenance",
      description: "Daily maintenance calories are on the lower side",
      badgeClass: "bg-violet-100 text-violet-700",
    };
  }

  if (tdee < 2800) {
    return {
      label: "Moderate maintenance",
      description: "Daily maintenance calories are in a moderate range",
      badgeClass: "bg-violet-100 text-violet-700",
    };
  }

  return {
    label: "Higher maintenance",
    description: "Daily maintenance calories are on the higher side",
    badgeClass: "bg-violet-100 text-violet-700",
  };
}

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

  const bmiStatus = getBmiStatus(bmi);
  const bmrStatus = getBmrStatus(bmr);
  const tdeeStatus = getTdeeStatus(tdee);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Body Summary</h2>
        <p className="mt-2 text-slate-500">
          Quick health and energy metrics based on your current profile.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className={`rounded-2xl border p-5 ${bmiStatus.cardClass}`}>
          <p className="text-sm text-slate-500">BMI</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{bmi.toFixed(1)}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${bmiStatus.badgeClass}`}>
              {bmiStatus.label}
            </span>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${bmiStatus.recommendationClass}`}
            >
              Focus: {bmiStatus.recommendation}
            </span>
          </div>

          <p className="mt-4 text-sm text-slate-600">{bmiStatus.description}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-slate-500">BMR</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{Math.round(bmr)}</p>

          <div className="mt-4">
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${bmrStatus.badgeClass}`}>
              {bmrStatus.label}
            </span>
          </div>

          <p className="mt-4 text-sm text-slate-600">{bmrStatus.description}</p>
          <p className="mt-2 text-sm font-medium text-slate-700">Calories burned at rest</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-slate-500">TDEE</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{Math.round(tdee)}</p>

          <div className="mt-4">
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${tdeeStatus.badgeClass}`}>
              {tdeeStatus.label}
            </span>
          </div>

          <p className="mt-4 text-sm text-slate-600">{tdeeStatus.description}</p>
          <p className="mt-2 text-sm font-medium text-slate-700">Maintenance calories/day</p>
        </div>
      </div>
    </section>
  );
}