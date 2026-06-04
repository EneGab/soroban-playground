"use client";

import React, { useState } from "react";
import {
  Copy,
  ExternalLink,
  Check,
  Code2,
  Tag,
  BookOpen,
  Zap,
  Target,
} from "lucide-react";
import { TemplateMetadata, getStatusColor, getDifficultyColor } from "../utils/templateUtils";

interface Props {
  template: TemplateMetadata;
  onClose?: () => void;
  onDeploy?: (templateId: string) => Promise<void>;
  isDeploying?: boolean;
}

const DOCUMENTATION_SECTIONS = {
  overview: "Overview",
  features: "Features",
  useCases: "Use Cases",
  exampleCode: "Example Code",
  gettingStarted: "Getting Started",
};

export default function TemplateDocumentation({
  template,
  onClose,
  onDeploy,
  isDeploying = false,
}: Props) {
  const [activeTab, setActiveTab] = useState<keyof typeof DOCUMENTATION_SECTIONS>("overview");
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    if (template.exampleCode) {
      navigator.clipboard.writeText(template.exampleCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleDeploy = async () => {
    if (onDeploy) {
      try {
        await onDeploy(template.id);
      } catch (error) {
        console.error("Deploy failed:", error);
      }
    }
  };

  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 backdrop-blur-sm">
      {/* Header */}
      <div className="border-b border-white/8 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{template.name}</h1>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getDifficultyColor(template.difficulty)}`}
              >
                {template.difficulty}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusColor(template.documentationStatus)}`}
              >
                {template.documentationStatus} docs
              </span>
            </div>
            <p className="text-sm text-slate-400">{template.description}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 transition"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-white/8 overflow-x-auto">
          {Object.entries(DOCUMENTATION_SECTIONS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as keyof typeof DOCUMENTATION_SECTIONS)}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 whitespace-nowrap ${
                activeTab === key
                  ? "text-teal-300 border-teal-300"
                  : "text-slate-500 border-transparent hover:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mb-6 space-y-4">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/8 bg-slate-950/50 p-4">
                  <p className="text-xs text-slate-500 mb-1">Category</p>
                  <p className="text-sm font-semibold text-white">{template.category}</p>
                </div>
                <div className="rounded-xl border border-white/8 bg-slate-950/50 p-4">
                  <p className="text-xs text-slate-500 mb-1">Documentation Status</p>
                  <p className="text-sm font-semibold capitalize text-white">
                    {template.documentationStatus}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-white/8 bg-slate-950/50 p-4">
                <p className="text-xs text-slate-500 mb-3">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-teal-400/20 px-3 py-1 text-xs text-teal-200 border border-teal-400/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/8 bg-slate-950/50 p-4">
                <p className="text-xs text-slate-500 mb-2">Contract Path</p>
                <p className="text-xs font-mono text-cyan-300 break-all">{template.path}</p>
              </div>
            </div>
          )}

          {activeTab === "features" && (
            <div className="space-y-3">
              {template.features.length > 0 ? (
                template.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-lg border border-white/8 bg-slate-950/50 p-3">
                    <Zap size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No features documented yet.</p>
              )}
            </div>
          )}

          {activeTab === "useCases" && (
            <div className="space-y-3">
              {template.useCases.length > 0 ? (
                template.useCases.map((useCase, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-lg border border-white/8 bg-slate-950/50 p-3">
                    <Target size={16} className="text-teal-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{useCase}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No use cases documented yet.</p>
              )}
            </div>
          )}

          {activeTab === "exampleCode" && (
            <div className="space-y-3">
              {template.exampleCode ? (
                <div className="relative rounded-lg border border-white/8 bg-slate-950 overflow-hidden">
                  <div className="absolute right-3 top-3">
                    <button
                      onClick={handleCopyCode}
                      className="rounded-lg bg-slate-800 hover:bg-slate-700 p-2 transition flex items-center gap-2"
                    >
                      {copiedCode ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          <span className="text-xs text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} className="text-slate-400" />
                          <span className="text-xs text-slate-400">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto text-xs text-slate-300 font-mono">
                    <code>{template.exampleCode}</code>
                  </pre>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No example code available yet.</p>
              )}
            </div>
          )}

          {activeTab === "gettingStarted" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-white/8 bg-slate-950/50 p-4">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <BookOpen size={16} className="text-teal-400" />
                  Quick Start
                </h3>
                <ol className="space-y-3 text-sm text-slate-300">
                  <li className="flex gap-3">
                    <span className="font-mono text-teal-400">1.</span>
                    <span>Click the "Deploy" button to initialize this template in the playground</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-teal-400">2.</span>
                    <span>Review the contract code in the editor</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-teal-400">3.</span>
                    <span>Build and compile the contract using the Build button</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-teal-400">4.</span>
                    <span>Deploy to Stellar Testnet using the Deploy button</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-teal-400">5.</span>
                    <span>Interact with your contract using the invoke interface</span>
                  </li>
                </ol>
              </div>

              <div className="rounded-lg border border-white/8 bg-slate-950/50 p-4">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Code2 size={16} className="text-emerald-400" />
                  Prerequisites
                </h3>
                <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                  <li>Basic understanding of Rust</li>
                  <li>Stellar testnet account (created automatically)</li>
                  <li>Familiarity with smart contract concepts</li>
                </ul>
              </div>

              <div className="rounded-lg border border-white/8 bg-slate-950/50 p-4">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <ExternalLink size={16} className="text-blue-400" />
                  Learn More
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li>
                    <a href="https://soroban.stellar.org/docs" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                      Soroban Documentation →
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/stellar/soroban-examples" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                      Soroban Examples Repository →
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-white/8 px-6 py-4 flex justify-end gap-3">
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium border border-white/12 text-slate-300 hover:text-white hover:border-white/20 transition"
          >
            Close
          </button>
        )}
        {onDeploy && (
          <button
            onClick={handleDeploy}
            disabled={isDeploying}
            className="rounded-lg px-6 py-2 text-sm font-medium bg-teal-500/20 text-teal-200 border border-teal-400/30 hover:bg-teal-500/30 hover:border-teal-400/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeploying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-400"></div>
                Deploying...
              </>
            ) : (
              <>
                <ExternalLink size={14} />
                Deploy Template
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
