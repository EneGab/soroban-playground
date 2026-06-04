"use client";

import React, { useState, useMemo } from "react";
import { BookOpen, Grid, List } from "lucide-react";
import DocumentationSearchBar from "./DocumentationSearchBar";
import TemplateDocumentation from "./TemplateDocumentation";
import {
  TemplateMetadata,
  TEMPLATES_CATALOG,
  searchTemplates,
  filterTemplatesByCategory,
  filterTemplatesByDifficulty,
  getCategories,
  getDifficultyColor,
  getStatusColor,
} from "../utils/templateUtils";

interface Props {
  onDeployTemplate?: (templateId: string) => Promise<void>;
}

type ViewMode = "grid" | "list";

export default function TemplateLibraryDashboard({ onDeployTemplate }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedDocStatus, setSelectedDocStatus] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateMetadata | null>(null);
  const [deployingId, setDeployingId] = useState<string | null>(null);

  const categories = useMemo(() => getCategories(), []);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    let results: TemplateMetadata[] = TEMPLATES_CATALOG;

    // Apply search
    if (searchQuery) {
      results = searchTemplates(searchQuery);
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      results = results.filter((t) => t.category === selectedCategory);
    }

    // Apply difficulty filter
    if (selectedDifficulty !== "all") {
      results = results.filter((t) => t.difficulty === selectedDifficulty);
    }

    // Apply doc status filter
    if (selectedDocStatus !== "all") {
      results = results.filter((t) => t.documentationStatus === selectedDocStatus);
    }

    return results;
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedDocStatus]);

  const handleDeploy = async (templateId: string) => {
    if (!onDeployTemplate) return;

    setDeployingId(templateId);
    try {
      await onDeployTemplate(templateId);
      setSelectedTemplate(null);
    } catch (error) {
      console.error("Deploy failed:", error);
    } finally {
      setDeployingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen size={28} className="text-teal-400" />
          <h1 className="text-3xl font-bold text-white">Contract Template Library</h1>
        </div>
        <p className="text-slate-400">
          Browse {TEMPLATES_CATALOG.length} production-ready smart contract templates with
          integrated documentation and deployment capabilities
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <DocumentationSearchBar
          onSearch={setSearchQuery}
          placeholder="Search templates by name, tags, or category..."
          initialValue={searchQuery}
        />
      </div>

      {/* Filters and Controls */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-400">CATEGORY</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-white/12 bg-white/5 px-3 py-1.5 text-xs text-white hover:border-white/20 transition focus:border-teal-400 outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name} ({cat.count})
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-400">DIFFICULTY</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="rounded-lg border border-white/12 bg-white/5 px-3 py-1.5 text-xs text-white hover:border-white/20 transition focus:border-teal-400 outline-none"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Documentation Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-400">DOCS</label>
            <select
              value={selectedDocStatus}
              onChange={(e) => setSelectedDocStatus(e.target.value)}
              className="rounded-lg border border-white/12 bg-white/5 px-3 py-1.5 text-xs text-white hover:border-white/20 transition focus:border-teal-400 outline-none"
            >
              <option value="all">All Status</option>
              <option value="complete">Complete</option>
              <option value="partial">Partial</option>
              <option value="missing">Missing</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 border border-white/12 rounded-lg p-1 bg-white/5">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded transition ${
              viewMode === "grid"
                ? "bg-teal-400/20 text-teal-200 border border-teal-400/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Grid view"
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded transition ${
              viewMode === "list"
                ? "bg-teal-400/20 text-teal-200 border border-teal-400/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="List view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-slate-500">
        Showing {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""}
      </div>

      {/* Templates Grid/List */}
      {filteredTemplates.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-3"
          }
        >
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isListView={viewMode === "list"}
              isDeploying={deployingId === template.id}
              onSelect={() => setSelectedTemplate(template)}
              onDeploy={() => handleDeploy(template.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/8 bg-white/5 p-12 text-center">
          <BookOpen size={32} className="mx-auto mb-4 text-slate-500" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">No templates found</h3>
          <p className="text-sm text-slate-500">
            Try adjusting your search filters or clearing the search query
          </p>
        </div>
      )}

      {/* Documentation Modal */}
      {selectedTemplate && (
        <DocumentationModal
          template={selectedTemplate}
          isDeploying={deployingId === selectedTemplate.id}
          onClose={() => setSelectedTemplate(null)}
          onDeploy={() => handleDeploy(selectedTemplate.id)}
        />
      )}
    </div>
  );
}

/**
 * Template Card Component
 */
interface TemplateCardProps {
  template: TemplateMetadata;
  isListView?: boolean;
  isDeploying?: boolean;
  onSelect: () => void;
  onDeploy: () => void;
}

function TemplateCard({
  template,
  isListView,
  isDeploying,
  onSelect,
  onDeploy,
}: TemplateCardProps) {
  if (isListView) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/5 hover:bg-white/8 transition p-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-white truncate">{template.name}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize flex-shrink-0 ${getDifficultyColor(template.difficulty)}`}
            >
              {template.difficulty}
            </span>
          </div>
          <p className="text-sm text-slate-400 truncate">{template.description}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            {template.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs text-teal-300">
                #{tag}
              </span>
            ))}
            {template.tags.length > 2 && (
              <span className="text-xs text-slate-500">+{template.tags.length - 2} more</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onSelect}
            className="rounded-lg px-3 py-1.5 text-xs font-medium border border-white/12 text-slate-300 hover:text-white hover:border-white/20 transition"
          >
            View Docs
          </button>
          <button
            onClick={onDeploy}
            disabled={isDeploying}
            className="rounded-lg px-3 py-1.5 text-xs font-medium bg-teal-500/20 text-teal-200 border border-teal-400/30 hover:bg-teal-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeploying ? "..." : "Deploy"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group rounded-xl border border-white/8 bg-gradient-to-br from-white/5 to-white/2 hover:border-teal-400/50 hover:bg-white/10 transition cursor-pointer overflow-hidden"
      onClick={onSelect}
    >
      {/* Card Header */}
      <div className="p-4 border-b border-white/8">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-white line-clamp-2">{template.name}</h3>
        </div>
        <p className="text-xs text-slate-400 line-clamp-2">{template.description}</p>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getDifficultyColor(template.difficulty)}`}
          >
            {template.difficulty}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getStatusColor(template.documentationStatus)}`}
          >
            {template.documentationStatus} docs
          </span>
        </div>

        {/* Category */}
        <div>
          <p className="text-xs text-slate-500 mb-1">Category</p>
          <p className="text-xs font-semibold text-slate-300">{template.category}</p>
        </div>

        {/* Tags */}
        <div>
          <p className="text-xs text-slate-500 mb-1">Tags</p>
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-teal-400/15 px-2 py-0.5 text-xs text-teal-300"
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="text-xs text-slate-500">+{template.tags.length - 3}</span>
            )}
          </div>
        </div>

        {/* Features Count */}
        <div className="text-xs text-slate-500">
          {template.features.length} features • {template.useCases.length} use cases
        </div>
      </div>

      {/* Card Footer */}
      <div className="border-t border-white/8 px-4 py-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeploy();
          }}
          disabled={isDeploying}
          className="flex-1 rounded-lg px-3 py-1.5 text-xs font-medium bg-teal-500/20 text-teal-200 border border-teal-400/30 hover:bg-teal-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeploying ? "..." : "Deploy"}
        </button>
      </div>
    </div>
  );
}

/**
 * Documentation Modal Component
 */
interface DocumentationModalProps {
  template: TemplateMetadata;
  isDeploying?: boolean;
  onClose: () => void;
  onDeploy: () => void;
}

function DocumentationModal({
  template,
  isDeploying,
  onClose,
  onDeploy,
}: DocumentationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <TemplateDocumentation
          template={template}
          onClose={onClose}
          onDeploy={() => {
            onDeploy();
          }}
          isDeploying={isDeploying}
        />
      </div>
    </div>
  );
}
