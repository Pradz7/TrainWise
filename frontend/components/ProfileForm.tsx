"use client";

import { UserProfile } from "@/types";

type Props = {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onGenerateNutrition: () => void;
  onGenerateWorkout: () => void;
  onResetProfile: () => void;
  nutritionLoading: boolean;
  workoutLoading: boolean;
};

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

export default function ProfileForm({
  profile,
  setProfile,
  onGenerateNutrition,
  onGenerateWorkout,
  onResetProfile,
  nutritionLoading,
  workoutLoading,
}: Props) {
  const updateField = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white shadow-sm p-6 md:p-7">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-slate-900">TrainWise Profile</h2>
        <p className="mt-2 text-slate-500">
          Enter your body metrics, goal, and preferences for personalized recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Name">
          <input
            placeholder="Enter your name"
            value={profile.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </Field>

        <Field label="Age">
          <input
            type="number"
            min={13}
            max={80}
            placeholder="Enter your age"
            value={profile.age === 18 ? "" : profile.age}
            onChange={(e) => updateField("age", e.target.value === "" ? 18 : Number(e.target.value))}
          />
        </Field>

        <Field label="Sex">
          <select
            value={profile.sex}
            onChange={(e) => updateField("sex", e.target.value as UserProfile["sex"])}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </Field>

        <Field label="Weight (kg)">
          <input
            type="number"
            min={20}
            max={300}
            step="0.1"
            placeholder="Enter your weight"
            value={profile.weight_kg === 50 ? "" : profile.weight_kg}
            onChange={(e) => updateField("weight_kg", e.target.value === "" ? 50 : Number(e.target.value))}
          />
        </Field>

        <Field label="Height (cm)">
          <input
            type="number"
            min={100}
            max={250}
            step="0.1"
            placeholder="Enter your height"
            value={profile.height_cm === 170 ? "" : profile.height_cm}
            onChange={(e) => updateField("height_cm", e.target.value === "" ? 170 : Number(e.target.value))}
          />
        </Field>

        <Field label="Goal">
          <select
            value={profile.goal}
            onChange={(e) => updateField("goal", e.target.value as UserProfile["goal"])}
          >
            <option value="fat_loss">Fat Loss</option>
            <option value="muscle_gain">Muscle Gain</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </Field>

        <Field label="Activity Level">
          <select
            value={profile.activity_level}
            onChange={(e) =>
              updateField("activity_level", e.target.value as UserProfile["activity_level"])
            }
          >
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
            <option value="very_active">Very Active</option>
          </select>
        </Field>

        <Field label="Diet Preference">
          <select
            value={profile.diet_preference}
            onChange={(e) =>
              updateField("diet_preference", e.target.value as UserProfile["diet_preference"])
            }
          >
            <option value="balanced">Balanced</option>
            <option value="high_protein">High Protein</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
          </select>
        </Field>

        <Field label="Equipment">
          <select
            value={profile.equipment}
            onChange={(e) =>
              updateField("equipment", e.target.value as UserProfile["equipment"])
            }
          >
            <option value="bodyweight">Bodyweight</option>
            <option value="dumbbells">Dumbbells</option>
            <option value="full_gym">Full Gym</option>
          </select>
        </Field>

        <Field label="Training Days / Week">
          <input
            type="number"
            min={2}
            max={7}
            placeholder="How many days?"
            value={profile.training_days === 3 ? "" : profile.training_days}
            onChange={(e) => updateField("training_days", e.target.value === "" ? 3 : Number(e.target.value))}
          />
        </Field>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <button
          onClick={onGenerateNutrition}
          disabled={nutritionLoading}
          className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-5 py-3 font-semibold shadow-sm"
        >
          {nutritionLoading ? "Generating Nutrition..." : "Generate Nutrition Plan"}
        </button>

        <button
          onClick={onGenerateWorkout}
          disabled={workoutLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-5 py-3 font-semibold shadow-sm"
        >
          {workoutLoading ? "Generating Workout..." : "Generate Workout Plan"}
        </button>

        <button
          type="button"
          onClick={onResetProfile}
          className="border border-slate-300 bg-white text-slate-700 px-5 py-3 font-semibold shadow-sm hover:bg-slate-50"
        >
          Reset Profile
        </button>
      </div>
    </section>
  );
}