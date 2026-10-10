'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  Network, 
  Info, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface GraphNode {
  id: string;
  label: string;
  type: 'DOCUMENT' | 'CLAIM' | 'ENTITY' | 'ISSUER' | 'EVIDENCE' | 'BLOCKCHAIN RECORD';
  metadata: Record<string, string | number | boolean | null>;
  x?: number;
  y?: number;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export default function EvidenceGraphPage() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(1100);

  useEffect(() => {
    const element = canvasRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setCanvasWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    api.getEvidenceGraph().then(data => {
      // Keep each node in a distinct slot within its evidence tier.
      const counts: Record<string, number> = {};
      const claimCount = data.nodes.filter(node => node.type === 'CLAIM').length;
      const positioned = data.nodes.map(node => {
        const index = counts[node.type] || 0;
        counts[node.type] = index + 1;
        const positions: Record<string, [number, number, number]> = {
          'ISSUER': [35, 130, 420],
          'DOCUMENT': [250, 110, 245],
          'CLAIM': [465, 80, 88],
          'EVIDENCE': [680, 80, 88],
          'BLOCKCHAIN RECORD': [895, 95, 112],
          'ENTITY': [465, 80 + claimCount * 88 + 90, 90],
        };
        const [x, firstY, step] = positions[node.type] || [465, 80, 90];
        return { ...node, x, y: firstY + index * step };
      });
      setNodes(positioned);
      setEdges(data.edges);
      if (positioned.length > 0) {
        setSelectedNode(positioned[0]);
      }
    });
  }, []);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'DOCUMENT': return { bg: 'bg-blue-900/60', border: 'border-blue-500', text: 'text-blue-300', dot: '#3b82f6' };
      case 'CLAIM': return { bg: 'bg-sky-900/60', border: 'border-sky-400', text: 'text-sky-300', dot: '#0ea5e9' };
      case 'ENTITY': return { bg: 'bg-emerald-900/60', border: 'border-emerald-500', text: 'text-emerald-300', dot: '#10b981' };
      case 'ISSUER': return { bg: 'bg-purple-900/60', border: 'border-purple-500', text: 'text-purple-300', dot: '#a855f7' };
      case 'EVIDENCE': return { bg: 'bg-amber-900/60', border: 'border-amber-500', text: 'text-amber-300', dot: '#f59e0b' };
      case 'BLOCKCHAIN RECORD': return { bg: 'bg-yellow-950/80', border: 'border-yellow-500', text: 'text-yellow-300', dot: '#eab308' };
      default: return { bg: 'bg-slate-800', border: 'border-slate-600', text: 'text-slate-300', dot: '#64748b' };
    }
  };

  const fitScale = Math.max(0.68, Math.min(1, (canvasWidth - 36) / 1100));
  const graphScale = fitScale * zoom;
  const graphHeight = Math.max(800, ...nodes.map(node => (node.y || 0) + 100));

  const filteredNodes = nodes.filter(n => filterType === 'ALL' || n.type === filterType);
  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = edges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));

  return (
    <div className="evidence-page flex-1 bg-[#070b14] flex flex-col">
      {/* Top Controls Bar */}
      <div className="evidence-toolbar p-4 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-purple-400">
            <Network className="h-4 w-4" />
            <span>INTERACTIVE EVIDENCE GRAPH TOPOLOGY</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Provenance Network
          </h1>
        </div>

        {/* Node Filters */}
        <div className="evidence-filters flex flex-wrap items-center gap-1.5 text-xs">
          {['ALL', 'DOCUMENT', 'CLAIM', 'EVIDENCE', 'ISSUER', 'BLOCKCHAIN RECORD'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors ${
                filterType === t
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1.5 text-slate-400">
          <button
            onClick={() => setZoom(prev => Math.max(0.6, prev - 0.1))}
            className="p-1.5 rounded-lg bg-slate-900 hover:text-white border border-slate-800"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="font-mono text-xs w-12 text-center text-slate-300">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(prev => Math.min(1.4, prev + 0.1))}
            className="p-1.5 rounded-lg bg-slate-900 hover:text-white border border-slate-800"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded-lg bg-slate-900 hover:text-white border border-slate-800"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main split: Left Graph Canvas, Right Metadata Drawer */}
      <div className="evidence-layout flex-1 flex flex-col lg:flex-row">
        {/* GRAPH CANVAS */}
        <div ref={canvasRef} className="evidence-canvas flex-1 relative overflow-auto bg-[#04070f] tech-grid p-4">
          <p className="evidence-pan-hint">Swipe the graph to explore all connections. Select a node to inspect it.</p>
          <div className="relative" style={{ width: 1100 * graphScale, height: graphHeight * graphScale }}>
          <svg
            width="1100"
            height={graphHeight}
            className="absolute left-0 top-0 transition-transform duration-150 origin-top-left"
            style={{ transform: `scale(${graphScale})` }}
            role="img"
            aria-label="Evidence graph connecting issuers, documents, claims, and source evidence"
          >
            {/* Draw Edges */}
            {filteredEdges.map((edge) => {
              const src = nodes.find(n => n.id === edge.source);
              const tgt = nodes.find(n => n.id === edge.target);
              if (!src || !tgt || src.x === undefined || src.y === undefined || tgt.x === undefined || tgt.y === undefined) return null;

              const isHighlighted = selectedNode && (selectedNode.id === src.id || selectedNode.id === tgt.id);

              return (
                <g key={edge.id}>
                  <line
                    x1={src.x + 80}
                    y1={src.y + 25}
                    x2={tgt.x + 80}
                    y2={tgt.y + 25}
                    stroke={isHighlighted ? '#367bb5' : '#9badc2'}
                    strokeWidth={isHighlighted ? 2.2 : 1}
                    strokeDasharray={isHighlighted ? 'none' : '3 4'}
                    opacity={isHighlighted ? 0.9 : 0.23}
                  />
                  {isHighlighted && <text
                    x={(src.x + tgt.x) / 2 + 80}
                    y={(src.y + tgt.y) / 2 + 20}
                    fill='#42729b'
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {edge.label}
                  </text>}
                </g>
              );
            })}

            {/* Draw Nodes */}
            {filteredNodes.map((node) => {
              const colors = getNodeColor(node.type);
              const isSelected = selectedNode?.id === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNode(node)}
                  onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedNode(node); } }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Inspect ${node.type.toLowerCase()} ${node.label}`}
                  className="cursor-pointer group"
                >
                  <rect
                    width="170"
                    height="50"
                    rx="10"
                    fill={isSelected ? '#e9f3fc' : '#ffffff'}
                    stroke={isSelected ? '#24649b' : colors.dot}
                    strokeWidth={isSelected ? '2.5' : '1'}
                    className="transition-all"
                  />
                  {/* Color strip */}
                  <rect
                    x="0"
                    y="0"
                    width="6"
                    height="50"
                    rx="3"
                    fill={colors.dot}
                  />

                  {/* Type label */}
                  <text
                    x="16"
                    y="18"
                    fill={colors.dot}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {node.type}
                  </text>

                  {/* Node title */}
                  <text
                    x="16"
                    y="36"
                    fill="#20314a"
                    fontSize="11"
                    fontWeight="600"
                    className="truncate"
                  >
                    {node.label.length > 20 ? node.label.substring(0, 19) + '…' : node.label}
                  </text>
                </g>
              );
            })}
          </svg>
          </div>
        </div>

        {/* METADATA INSPECTOR DRAWER */}
        <div className="evidence-inspector w-full lg:w-[380px] xl:w-[420px] border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-950 p-6 flex flex-col justify-between shrink-0 overflow-y-auto">
          {selectedNode ? (
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 text-xs font-mono mb-1">
                  <span className="text-slate-400">NODE INSPECTOR:</span>
                  <span className="font-bold text-sky-400">{selectedNode.type}</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {selectedNode.label}
                </h2>
                <span className="text-xs text-slate-500 font-mono">ID: {selectedNode.id}</span>
              </div>

              {/* Dynamic Metadata Attributes */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                  Attributed Metadata
                </span>
                {Object.entries(selectedNode.metadata).map(([key, val]) => (
                  <div key={key} className="space-y-0.5">
                    <span className="text-[11px] font-mono text-slate-400 uppercase">{key}:</span>
                    <div className="text-slate-200 font-mono text-xs break-all bg-slate-950 p-2 rounded border border-slate-800/80">
                      {typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action based on node type */}
              {selectedNode.type === 'CLAIM' && (
                <div className="space-y-2">
                  <Link
                    href={`/claims/${selectedNode.metadata.id || 'claim-1'}`}
                    className="w-full flex items-center justify-center space-x-2 rounded-xl bg-sky-600 hover:bg-sky-500 py-2.5 text-xs font-semibold text-white transition-colors"
                  >
                    <span>Open Claim Verification Dossier</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}

              {selectedNode.type === 'DOCUMENT' && (
                <div className="space-y-2">
                  <Link
                    href={`/documents/${selectedNode.metadata.id || 'doc-1'}`}
                    className="w-full flex items-center justify-center space-x-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-semibold text-white transition-colors"
                  >
                    <span>Open Split-Screen Document Viewer</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-12 space-y-2">
              <Info className="h-8 w-8 mx-auto text-slate-600" />
              <p className="text-xs">Select any node in the graph to inspect connected provenance metadata.</p>
            </div>
          )}

          {/* Bottom legend */}
          <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 font-mono space-y-1">
            <p><strong>Topological Hierarchy:</strong></p>
            <p>Issuer → Document → Claim → Evidence & Blockchain Anchor</p>
          </div>
        </div>
      </div>
    </div>
  );
}
