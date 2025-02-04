import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, ChevronLeft, Folder, FolderPlus, File, Edit2, Trash2, Plus, X } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { UserCard } from '../auth/UserCard';
import { cn } from '../../utils/cn';

interface ProjectItemProps {
  project: {
    id: string;
    name: string;
    parentId: string | null;
  };
  level: number;
  onSelect: (id: string) => void;
  selectedId: string | null;
}

function ProjectItem({ project, level, onSelect, selectedId }: ProjectItemProps) {
  const { projects, updateProject, deleteProject, createProject } = useProjectStore();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(project.name);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCreatingSubproject, setIsCreatingSubproject] = useState(false);
  const [newSubprojectName, setNewSubprojectName] = useState('');
  const [showActions, setShowActions] = useState(false);

  const subProjects = projects.filter(p => p.parentId === project.id);
  const hasSubProjects = subProjects.length > 0;
  const isTopLevel = project.parentId === null;

  const handleUpdate = async () => {
    if (newName.trim() && newName !== project.name) {
      await updateProject(project.id, newName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setNewName(project.name);
    }
  };

  const handleCreateSubproject = async () => {
    if (newSubprojectName.trim()) {
      await createProject(newSubprojectName.trim(), project.id);
      setNewSubprojectName('');
      setIsCreatingSubproject(false);
      setIsExpanded(true);
    }
  };

  const handleDelete = async () => {
    const message = isTopLevel 
      ? 'Are you sure you want to delete this folder and all its BPMN projects?'
      : 'Are you sure you want to delete this BPMN project? This will delete all diagrams and chat history.';
      
    if (confirm(message)) {
      await deleteProject(project.id);
    }
  };

  const handleSelect = () => {
    // Only allow selecting non-top-level projects (BPMN projects)
    if (!isTopLevel) {
      onSelect(project.id);
    }
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          "group flex items-center gap-2 px-2 py-1 rounded-md",
          "hover:bg-gray-100",
          selectedId === project.id && "bg-blue-50 hover:bg-blue-100",
          !isTopLevel && "cursor-pointer"
        )}
        style={{ paddingLeft: `${level * 16}px` }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "p-0.5 rounded hover:bg-gray-200",
            !hasSubProjects && !showActions && "invisible"
          )}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {isTopLevel ? (
          <Folder className="w-4 h-4 text-blue-500" />
        ) : (
          <File className="w-4 h-4 text-gray-500" />
        )}

        <div className="flex-1 min-w-0" onClick={handleSelect}>
          {isEditing ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleUpdate}
              onKeyDown={handleKeyDown}
              className="w-full px-1 py-0.5 text-sm border rounded"
              autoFocus
            />
          ) : (
            <span className="block truncate">{project.name}</span>
          )}
        </div>

        {showActions && (
          <div className="flex gap-1">
            {isTopLevel && (
              <button
                onClick={() => setIsCreatingSubproject(true)}
                className="p-1 rounded hover:bg-gray-200"
                title="Add BPMN project"
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 rounded hover:bg-gray-200"
              title="Rename"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 rounded hover:bg-gray-200 text-red-500"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {isCreatingSubproject && (
        <div className="flex items-center gap-2 px-2 py-1 ml-7">
          <input
            type="text"
            value={newSubprojectName}
            onChange={(e) => setNewSubprojectName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateSubproject();
              if (e.key === 'Escape') {
                setIsCreatingSubproject(false);
                setNewSubprojectName('');
              }
            }}
            placeholder="BPMN project name..."
            className="flex-1 px-2 py-1 text-sm border rounded"
            autoFocus
          />
          <button
            onClick={handleCreateSubproject}
            className="p-1 rounded hover:bg-gray-100"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {isExpanded && (hasSubProjects || isCreatingSubproject) && (
        <div className="ml-4">
          {subProjects.map(subProject => (
            <ProjectItem
              key={subProject.id}
              project={subProject}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProjectWorkspaceProps {
  onClose?: () => void;
}

export function ProjectWorkspace({ onClose }: ProjectWorkspaceProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { projects, selectedProjectId, fetchProjects, createProject, setSelectedProject } = useProjectStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async () => {
    if (newProjectName.trim()) {
      await createProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreating(false);
    }
  };

  const rootProjects = projects.filter(p => p.parentId === null);

  return (
    <div className={cn(
      "h-full bg-white border-r transition-all duration-300 flex flex-col",
      isExpanded ? "w-64" : "w-12"
    )}>
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-gray-100"
          >
            {isExpanded ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isExpanded && <span className="font-medium">Workspace</span>}
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <button
              onClick={() => setIsCreating(true)}
              className="p-1 rounded hover:bg-gray-100"
              title="Create new folder"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          )}
          {/* Close button for mobile/tablet */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="flex-1 p-2 overflow-y-auto">
          {isCreating && (
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateProject();
                  if (e.key === 'Escape') {
                    setIsCreating(false);
                    setNewProjectName('');
                  }
                }}
                placeholder="Folder name..."
                className="flex-1 px-2 py-1 text-sm border rounded"
                autoFocus
              />
              <button
                onClick={handleCreateProject}
                className="p-1 rounded hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="space-y-1">
            {rootProjects.map(project => (
              <ProjectItem
                key={project.id}
                project={project}
                level={0}
                onSelect={setSelectedProject}
                selectedId={selectedProjectId}
              />
            ))}
          </div>
        </div>
      )}

      {isExpanded && <UserCard />}
    </div>
  );
}