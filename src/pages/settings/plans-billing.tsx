import SettingsLayout from "../../components/settings/SettingsLayout";
import React, { useState } from "react";


const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "/month",
    description: "Great for hobbyists and individuals working solo",
    button: <button className="w-full py-2 rounded bg-gray-200 text-gray-500 font-semibold cursor-default mt-4">Current plan</button>,
    features: [
      "1 seat max",
      "Unlimited personal files",
      "Unlimited link sharing",
      "Unlimited file viewers",
    ],
  },
  {
    name: "Professional",
    price: "$40",
    period: "/month",
    badge: "-20%",
    description: "Perfect for professionals working solo",
    button: (
      <>
        <div className="flex gap-2 justify-center mt-4 mb-2">
          <button className="px-4 py-1 rounded bg-gray-200 text-gray-700 font-medium text-xs">Monthly</button>
          <button className="px-4 py-1 rounded bg-gray-900 text-white font-medium text-xs">Annually</button>
        </div>
        <button className="w-full py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition">Upgrade</button>
      </>
    ),
    features: [
      "Everything in Starter, plus:",
      "1 seat max",
      "1 team",
      "Priority render queue",
      "Multi-image generation",
      "4k image export",
      "Advanced 3D generation",
      "Unlimited 3D exports",
      "Full design privacy",
    ],
    footer: (
      <div className="flex justify-between items-center mt-4 text-xs">
        <span className="text-gray-500">Free for education</span>
        <a href="#" className="text-indigo-600 font-medium hover:underline">Request access</a>
      </div>
    ),
  },
  {
    name: "Enterprise",
    price: "Let's talk",
    description: "Made for organizations looking to design at scale",
    button: <button className="w-full py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition mt-4">Contact Sales</button>,
    features: [
      "Everything in Pro, plus:",
      "Unlimited teams",
      "Single Sign-On (SSO)",
      "Custom AI models",
      "Batch generating",
      "Dedicated onboarding",
      "Custom billing",
      "Custom security & privacy",
      "Audit and access logs",
      "Private and public teams",
      "Team management",
      "Priority support",
    ],
  },
];

export default function PlansBillingSettingsPage() {
  return (
    <SettingsLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Plans</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {plans.map((plan, i) => (
          <div key={plan.name} className="flex-1 bg-white rounded-2xl shadow border border-gray-200 p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-gray-900">{plan.name}</span>
              {plan.badge && (
                <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded">{plan.badge}</span>
              )}
            </div>
            <div className="flex items-end gap-1 mb-2">
              <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
              {plan.period && <span className="text-gray-500">{plan.period}</span>}
            </div>
            <div className="text-gray-500 text-sm mb-4">{plan.description}</div>
            {plan.button}
            <ul className="mt-6 mb-2 text-sm text-gray-700 space-y-2">
              {plan.features.map((f, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {plan.footer}
          </div>
        ))}
      </div>
    </SettingsLayout>
  );
}
