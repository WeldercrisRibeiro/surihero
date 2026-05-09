import { useCallback, useState, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  reconnectEdge,
  useReactFlow,
  ReactFlowProvider,
  type Connection,
  type Node,
  type Edge,
  MarkerType,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Plus,
  Save,
  Trash2,
  Edit3,
  FileText,
  X,
  GitBranch,
  Clock,
  Check,
  Download,
  Upload,
  ChevronRight,
  Workflow,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { toPng } from "html-to-image";

interface SavedFlow {
  id: string;
  title: string;
  description: string | null;
  nodes: Node[];
  edges: Edge[];
  created_at: string;
  updated_at: string;
}

const defaultNodes: Node[] = [
  {
    id: "1",
    position: { x: 100, y: 96 },
    data: { label: "Inicio" },
    type: 'input',
    sourcePosition: Position.Right,
    className: 'mind-map-node mind-map-node-main',
  },
  {
    id: "2",
    position: { x: 450, y: 100 },
    data: { label: "Fluxo" },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    className: 'mind-map-node mind-map-node-active',
  },
  {
    id: "3",
    position: { x: 800, y: 100 },
    data: { label: "Fim" },
    type: 'output',
    targetPosition: Position.Left,
    className: 'mind-map-node',
  },
];

const defaultEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: 'smoothstep',
    style: { stroke: "#00e5ff", strokeWidth: 3 },
    pathOptions: { borderRadius: 20 },
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    type: 'smoothstep',
    style: { stroke: "#00e5ff", strokeWidth: 3 },
    pathOptions: { borderRadius: 20 },
  },
];

export default function WorkFlow() {
  return (
    <ReactFlowProvider>
      <FlowsContent />
    </ReactFlowProvider>
  );
}

function FlowsContent() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [nodeCount, setNodeCount] = useState(defaultNodes.length);
  const [savedFlows, setSavedFlows] = useState<SavedFlow[]>([]);
  const [editingFlow, setEditingFlow] = useState<SavedFlow | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saveDescription, setSaveDescription] = useState("");
  const [showSavedPanel, setShowSavedPanel] = useState(true);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [nodeLabelDraft, setNodeLabelDraft] = useState("");
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [edgeStyleDraft, setEdgeStyleDraft] = useState({ color: "#00e5ff", dashed: false });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [flowTitleDraft, setFlowTitleDraft] = useState("Novo Fluxo");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const edgeReconnectSuccessful = useRef(true);
  
  const buttonBase = "group flex items-center justify-center gap-3 rounded-2xl text-sm font-semibold transition-all duration-200 active:scale-[0.98]";
  const buttonSecondary = `${buttonBase} px-5 py-2.5 bg-secondary/40 text-secondary-foreground hover:bg-secondary/60 hover:shadow-sm border border-border/40`;
  const buttonPrimary = `${buttonBase} px-6 py-2.5 bg-cyan-500 text-white hover:bg-cyan-600 shadow-md shadow-cyan-500/20 border border-transparent`;
  const buttonDanger = `${buttonBase} px-5 py-2.5 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20`;
  const buttonGhost = `${buttonBase} px-4 py-2 text-foreground/80 hover:bg-accent hover:text-foreground`;

  const { deleteElements } = useReactFlow();

  const hasSelection = nodes.some((n) => n.selected) || edges.some((e) => e.selected);

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      if (changes.some((c: any) => c.type !== "select" && c.type !== "dimensions"))
        setHasUnsavedChanges(true);
    },
    [onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes);
      if (changes.some((c: any) => c.type !== "select"))
        setHasUnsavedChanges(true);
    },
    [onEdgesChange]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: 'smoothstep',
            style: { stroke: "#00e5ff", strokeWidth: 3 },
            pathOptions: { borderRadius: 20 },
          },
          eds
        )
      );
      setHasUnsavedChanges(true);
    },
    [setEdges]
  );

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true;
      setEdges((eds) => reconnectEdge(oldEdge, newConnection, eds));
      setHasUnsavedChanges(true);
    },
    [setEdges]
  );

  const onReconnectEnd = useCallback(
    (_: MouseEvent | TouchEvent, edge: Edge) => {
      if (!edgeReconnectSuccessful.current) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        setHasUnsavedChanges(true);
      }
      edgeReconnectSuccessful.current = true;
    },
    [setEdges]
  );

  const deleteSelected = () => {
    const selectedNodes = nodes.filter((n) => n.selected);
    const selectedEdges = edges.filter((e) => e.selected);
    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      toast.info("Selecione um elemento para remover");
      return;
    }
    deleteElements({ nodes: selectedNodes, edges: selectedEdges });
    setHasUnsavedChanges(true);
    toast.success("Elementos removidos");
  };

  const requestAction = (action: () => void) => {
    if (hasUnsavedChanges) {
      setPendingAction(() => action);
      setShowUnsavedDialog(true);
    } else {
      action();
    }
  };

  const addNode = () => {
    const id = `${nodeCount + 1}`;
    setNodeCount((c) => c + 1);
    setNodes((nds) => [
      ...nds,
      {
        id,
        position: { x: Math.random() * 400 + 50, y: Math.random() * 400 + 50 },
        data: { label: `Novo Fluxo ${id}` },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        className: 'mind-map-node',
      },
    ]);
  };

  const resetCanvas = () => {
    setNodes(defaultNodes);
    setEdges(defaultEdges);
    setNodeCount(defaultNodes.length);
    setEditingFlow(null);
    setFlowTitleDraft("Novo Fluxo");
    setHasUnsavedChanges(false);
  };

  const openSaveDialog = () => {
    if (editingFlow) {
      setSaveTitle(flowTitleDraft !== "Novo Fluxo" ? flowTitleDraft : editingFlow.title);
      setSaveDescription(editingFlow.description || "");
    } else {
      setSaveTitle(flowTitleDraft !== "Novo Fluxo" ? flowTitleDraft : "");
      setSaveDescription("");
    }
    setShowSaveDialog(true);
  };

  const handleSave = () => {
    if (!saveTitle.trim()) {
      toast.error("Informe um titulo");
      return;
    }
    if (editingFlow) {
      setSavedFlows((prev) =>
        prev.map((f) =>
          f.id === editingFlow.id
            ? {
                ...f,
                title: saveTitle.trim(),
                description: saveDescription.trim(),
                nodes: nodes as any,
                edges: edges as any,
                updated_at: new Date().toISOString(),
              }
            : f
        )
      );
      toast.success("Fluxo atualizado!");
    } else {
      const newFlow: SavedFlow = {
        id: Date.now().toString(),
        title: saveTitle.trim(),
        description: saveDescription.trim(),
        nodes: nodes as any,
        edges: edges as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setSavedFlows((prev) => [newFlow, ...prev]);
      toast.success("Fluxo salvo!");
    }
    setShowSaveDialog(false);
    resetCanvas();
  };

  const handleEdit = (flow: SavedFlow) => {
    setEditingFlow(flow);
    setNodes(flow.nodes);
    setEdges(flow.edges);
    setNodeCount(flow.nodes.length);
    setFlowTitleDraft(flow.title);
    setHasUnsavedChanges(false);
  };

  const handleDelete = (id: string) => {
    setSavedFlows((prev) => prev.filter((f) => f.id !== id));
    toast.success("Fluxo excluido");
    if (editingFlow?.id === id) resetCanvas();
  };

  const handleNodeDoubleClick = (_event: React.MouseEvent, node: Node) => {
    setEditingNodeId(node.id);
    setNodeLabelDraft(String(node.data?.label || ""));
  };

  const saveNodeLabel = () => {
    if (!editingNodeId) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === editingNodeId
          ? { ...n, data: { ...n.data, label: nodeLabelDraft } }
          : n
      )
    );
    setEditingNodeId(null);
  };

  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setEditingEdgeId(edge.id);
    const stroke = (edge.style?.stroke as string) || "#00e5ff";
    const dashed = !!edge.style?.strokeDasharray;
    setEdgeStyleDraft({ color: stroke, dashed });
  }, []);

  const saveEdgeStyle = () => {
    if (!editingEdgeId) return;
    setEdges((eds) =>
      eds.map((e) =>
        e.id === editingEdgeId
          ? {
              ...e,
              style: {
                ...e.style,
                stroke: edgeStyleDraft.color,
                strokeDasharray: edgeStyleDraft.dashed ? "5,5" : undefined,
              },
            }
          : e
      )
    );
    setEditingEdgeId(null);
    setHasUnsavedChanges(true);
  };

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      setEdges((eds) =>
        eds.filter((e) => !deleted.some((n) => n.id === e.source || n.id === e.target))
      );
      setHasUnsavedChanges(true);
    },
    [setEdges]
  );

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (!flowTitleDraft.trim()) {
      setFlowTitleDraft(editingFlow ? editingFlow.title : "Novo Fluxo");
    }
  };

  const saveAsPhoto = () => {
    const flowElement = document.querySelector(".react-flow") as HTMLElement;
    if (!flowElement) return;

    // Ocultar controles temporariamente para a foto
    const controls = document.querySelector(".react-flow__controls") as HTMLElement;
    if (controls) controls.style.display = "none";

    toPng(flowElement, {
      backgroundColor: isDark ? "#0f0f0f" : "#f8f9fa",
      style: {
        width: String(flowElement.offsetWidth),
        height: String(flowElement.offsetHeight),
      }
    })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `${flowTitleDraft}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("Foto salva com sucesso!");
        if (controls) controls.style.display = "flex";
      })
      .catch((err) => {
        console.error(err);
        toast.error("Erro ao salvar foto");
        if (controls) controls.style.display = "flex";
      });
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="flex w-full text-foreground"
      style={{
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        background: "hsl(var(--background))",
      }}
    >
      {/* LEFT: canvas area */}
      <div className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
        {/* Header */}
        <div
          className="flex items-center gap-4 px-6 border-b border-border bg-card/40 backdrop-blur-md z-10"
          style={{ minHeight: 64, paddingTop: 12, paddingBottom: 12 }}
        >
          {/* Title block */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Workflow className="w-4 h-4 text-cyan-500 shrink-0" />
            {isEditingTitle ? (
              <input
                type="text"
                autoFocus
                value={flowTitleDraft}
                onChange={(e) => {
                  setFlowTitleDraft(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTitleBlur();
                }}
                className="font-semibold text-base text-foreground bg-secondary px-2 py-0.5 rounded outline-none ring-2 ring-primary ring-offset-2 ring-offset-background w-full max-w-xs"
              />
            ) : (
              <h1
                onDoubleClick={() => setIsEditingTitle(true)}
                className="font-semibold text-base text-foreground cursor-text hover:text-primary transition-colors select-none truncate m-0"
                title="Clique duas vezes para editar"
              >
                {flowTitleDraft}
                {hasUnsavedChanges && (
                  <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                    *
                  </span>
                )}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 rounded-xl border border-border/40 bg-background/40 backdrop-blur-md px-3 py-2 shadow-sm">
              <button onClick={saveAsPhoto} className={buttonGhost} title="Salvar como Foto">
                <Camera className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                <span className="text-xs font-medium">Salvar como Foto</span>
              </button>
            </div>

            <div className="w-px h-6 bg-border/40 mx-1" />

            <div className="flex items-center gap-3">
              {hasSelection && (
                <button onClick={deleteSelected} className={buttonDanger}>
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              )}
              <button onClick={addNode} className={buttonSecondary}>
                <Plus className="w-4 h-4" />
                Novo Fluxo
              </button>
              {editingFlow && (
                <button onClick={() => requestAction(resetCanvas)} className={buttonSecondary}>
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              )}
            </div>

            <div className="w-px h-6 bg-border/40 mx-1" />

            <button onClick={openSaveDialog} className={buttonPrimary}>
              <Save className="w-4 h-4" />
              {editingFlow ? "Atualizar" : "Salvar"}
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            onNodeDoubleClick={handleNodeDoubleClick}
            onEdgeClick={onEdgeClick}
            onNodesDelete={onNodesDelete}
            onReconnect={onReconnect}
            onReconnectStart={onReconnectStart}
            onReconnectEnd={onReconnectEnd}
            deleteKeyCode={["Backspace", "Delete"]}
            fitView
            snapToGrid
            snapGrid={[20, 20]}
            colorMode={isDark ? "dark" : "light"}
            style={{ background: isDark ? "#0f0f0f" : "#f8f9fa" }}
          >
            <Background color={isDark ? "#333" : "#cbd5e1"} gap={20} size={1} />
            <Controls className={cn(
              "!rounded-lg !shadow-2xl",
              isDark 
                ? "!bg-[#1a1a1a] !border-[#333] [&>button]:!bg-[#1a1a1a] [&>button]:!border-[#333] [&>button]:!text-white [&>button:hover]:!bg-[#222]" 
                : "!bg-white !border-slate-200 [&>button]:!bg-white [&>button]:!border-slate-200 [&>button]:!text-slate-700 [&>button:hover]:!bg-slate-50"
            )} />
          </ReactFlow>

          {editingNodeId && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-20" onClick={() => setEditingNodeId(null)}>
              <div className="glass-card p-6 w-80 shadow-2xl rounded-3xl border border-border/50 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Renomear no</p>
                <input
                  value={nodeLabelDraft}
                  onChange={(e) => setNodeLabelDraft(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveNodeLabel();
                    if (e.key === "Escape") setEditingNodeId(null);
                  }}
                />
                <div className="flex gap-2 mt-6 justify-end">
                  <button onClick={() => setEditingNodeId(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors">Cancelar</button>
                  <button onClick={saveNodeLabel} className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                    <Check className="w-3.5 h-3.5" /> Salvar
                  </button>
                </div>
              </div>
            </div>
          )}

          {editingEdgeId && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-20" onClick={() => setEditingEdgeId(null)}>
              <div className="glass-card p-6 w-80 shadow-2xl rounded-3xl border border-border/50 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Estilo da Linha</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Cor da Linha</label>
                    <div className="grid grid-cols-5 gap-2">
                      {["#00e5ff", "#a855f7", "#eab308", "#ef4444", "#22c55e"].map((c) => (
                        <button
                          key={c}
                          onClick={() => setEdgeStyleDraft(prev => ({ ...prev, color: c }))}
                          className={`h-8 w-full rounded-lg transition-all ${edgeStyleDraft.color === c ? "ring-2 ring-offset-2 ring-primary scale-90" : "hover:scale-105"}`}
                          style={{ background: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-secondary/50 border border-border/30">
                    <span className="text-xs font-bold text-foreground">Linha Pontilhada</span>
                    <button
                      onClick={() => setEdgeStyleDraft(prev => ({ ...prev, dashed: !prev.dashed }))}
                      className={`w-10 h-5 rounded-full transition-colors relative ${edgeStyleDraft.dashed ? "bg-primary" : "bg-muted"}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${edgeStyleDraft.dashed ? "left-6" : "left-1"}`} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 mt-6 justify-end">
                  <button onClick={() => setEditingEdgeId(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-secondary transition-colors">Cancelar</button>
                  <button onClick={saveEdgeStyle} className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                    <Check className="w-3.5 h-3.5" /> Aplicar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: saved flows panel */}
      {showSavedPanel ? (
        <div className="flex flex-col border-l border-border bg-card/40" style={{ width: 280 }}>
          <div className="flex items-center justify-between px-4 border-b border-border" style={{ minHeight: 64, paddingTop: 12, paddingBottom: 12 }}>
            <div className="flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Fluxos Salvos</span>
              <span className="text-xs bg-secondary text-muted-foreground rounded-full px-1.5 py-0.5 font-medium leading-none">{savedFlows.length}</span>
            </div>
            <button onClick={() => setShowSavedPanel(false)} className="p-1 rounded hover:bg-secondary transition-colors" title="Recolher painel">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
            {savedFlows.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
                  <GitBranch className="w-5 h-5 text-muted-foreground opacity-60" />
                </div>
                <p className="text-sm text-muted-foreground">Nenhum fluxo salvo</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Salve um fluxo para ele aparecer aqui</p>
              </div>
            ) : (
              savedFlows.map((flow) => (
                <div key={flow.id} onDoubleClick={() => requestAction(() => handleEdit(flow))} className={`group relative px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${editingFlow?.id === flow.id ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-secondary/60"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate leading-snug">{flow.title}</p>
                      {flow.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{flow.description}</p>}
                      <div className="flex items-center gap-1 mt-1.5">
                        <Clock className="w-3 h-3 text-muted-foreground/60" />
                        <span className="text-xs text-muted-foreground/60">{formatDate(flow.updated_at)}</span>
                      </div>
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
                      <button onClick={(e) => { e.stopPropagation(); requestAction(() => handleEdit(flow)); }} className="p-1.5 rounded hover:bg-primary/10 transition-colors" title="Editar"><Edit3 className="w-3.5 h-3.5 text-primary" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(flow.id); }} className="p-1.5 rounded hover:bg-destructive/10 transition-colors" title="Excluir"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                    </div>
                  </div>
                  {editingFlow?.id === flow.id && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r-full" />}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <button onClick={() => setShowSavedPanel(true)} className="absolute right-4 top-20 p-2 rounded-lg bg-card border border-border shadow-lg hover:bg-secondary transition-colors z-10" title="Mostrar fluxos salvos">
          <FileText className="w-4 h-4 text-foreground" />
        </button>
      )}

      {showSaveDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowSaveDialog(false)}>
          <div className="glass-card p-6 w-full max-w-sm mx-4 glow-border" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-base text-foreground mb-1">{editingFlow ? "Atualizar fluxo" : "Salvar fluxo"}</h3>
            <p className="text-xs text-muted-foreground mb-4">{editingFlow ? "Atualize as informacoes do fluxo atual." : "De um nome para identificar este fluxo."}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Titulo <span className="text-destructive">*</span></label>
                <input type="text" value={saveTitle} onChange={(e) => setSaveTitle(e.target.value)} placeholder="Ex: Processo de Deploy" className="w-full px-3 py-2 rounded-lg bg-secondary border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" autoFocus />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Descricao <span className="text-muted-foreground font-normal">(opcional)</span></label>
                <textarea value={saveDescription} onChange={(e) => setSaveDescription(e.target.value)} placeholder="Breve descricao..." rows={3} className="w-full px-3 py-2 rounded-lg bg-secondary border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-5 justify-end">
              <button onClick={() => setShowSaveDialog(false)} className={buttonSecondary}>Cancelar</button>
              <button onClick={handleSave} className={buttonPrimary}>{editingFlow ? "Atualizar" : "Salvar"}</button>
            </div>
          </div>
        </div>
      )}

      {showUnsavedDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[60]" onClick={() => setShowUnsavedDialog(false)}>
          <div className="glass-card p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-base text-foreground mb-1">Alteracoes nao salvas</h3>
            <p className="text-sm text-muted-foreground mb-5">O fluxo atual tem edicoes em andamento. O que deseja fazer?</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => { setShowUnsavedDialog(false); openSaveDialog(); }} className={`${buttonPrimary} w-full`}>Salvar alteracoes</button>
              <button onClick={() => { setShowUnsavedDialog(false); if (pendingAction) pendingAction(); }} className={`${buttonDanger} w-full`}>Descartar e continuar</button>
              <button onClick={() => { setShowUnsavedDialog(false); setPendingAction(null); }} className={`${buttonSecondary} w-full`}>Continuar editando</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
