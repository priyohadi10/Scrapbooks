'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { Stage, Layer, Rect, Text, Circle, Line, Transformer, Group } from 'react-konva';
import Konva from 'konva';
import useEditorStore from '@/stores/editor-store';
import { ScrapbookElement } from '@/types';
import { snapToGrid } from '@/lib/utils';

export default function EditorCanvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const selectionRectRef = useRef<Konva.Rect>(null);

  const {
    project,
    currentPageId,
    selectedElementIds,
    zoom,
    showGrid,
    snapToGrid: snapGrid,
    selectElement,
    deselectAll,
    updateElement,
    moveElement,
    resizeElement,
    rotateElement,
    setIsDragging,
    setIsResizing,
    setIsRotating,
    pushHistory,
  } = useEditorStore();

  const currentPage = project?.pages.find((p) => p.id === currentPageId);
  const pageWidth = project?.settings.size.width || 1000;
  const pageHeight = project?.settings.size.height || 1000;

  const [selectionRect, setSelectionRect] = useState({
    visible: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Update transformer when selection changes
  useEffect(() => {
    if (transformerRef.current && stageRef.current) {
      const stage = stageRef.current;
      const selectedNodes = selectedElementIds
        .map((id) => stage.findOne(`#${id}`))
        .filter(Boolean) as Konva.Node[];

      transformerRef.current.nodes(selectedNodes);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedElementIds]);

  // Handle stage click to deselect
  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      deselectAll();
    }
  }, [deselectAll]);

  // Handle mouse down for selection box
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target !== e.target.getStage()) return;

    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    setSelectionRect({
      visible: true,
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
    });
  }, []);

  // Handle mouse move for selection box
  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!selectionRect.visible) return;

    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    setSelectionRect((prev) => ({
      ...prev,
      width: pos.x - prev.x,
      height: pos.y - prev.y,
    }));
  }, [selectionRect.visible]);

  // Handle mouse up for selection box
  const handleMouseUp = useCallback(() => {
    if (!selectionRect.visible) return;

    setSelectionRect((prev) => ({ ...prev, visible: false }));

    if (Math.abs(selectionRect.width) < 5 || Math.abs(selectionRect.height) < 5) return;

    const stage = stageRef.current;
    if (!stage) return;

    const box = {
      x: Math.min(selectionRect.x, selectionRect.x + selectionRect.width),
      y: Math.min(selectionRect.y, selectionRect.y + selectionRect.height),
      width: Math.abs(selectionRect.width),
      height: Math.abs(selectionRect.height),
    };

    const shapes = stage.find('.element');
    const selected = shapes.filter((shape) => {
      return Konva.Util.haveIntersection(box, shape.getClientRect());
    });

    if (selected.length > 0) {
      const ids = selected.map((s) => s.id());
      ids.forEach((id) => selectElement(id, true));
    }
  }, [selectionRect, selectElement]);

  // Handle element click
  const handleElementClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>, elementId: string) => {
    e.cancelBubble = true;
    const isMulti = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    selectElement(elementId, isMulti);
  }, [selectElement]);

  // Handle drag end
  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>, elementId: string) => {
    const node = e.target;
    let x = node.x();
    let y = node.y();

    if (snapGrid) {
      x = snapToGrid(x);
      y = snapToGrid(y);
      node.x(x);
      node.y(y);
    }

    moveElement(elementId, x, y);
    setIsDragging(false);
    pushHistory('move-element');
  }, [moveElement, snapGrid, setIsDragging, pushHistory]);

  // Handle transform end (resize/rotate)
  const handleTransformEnd = useCallback((e: Konva.KonvaEventObject<Event>, elementId: string) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    const newWidth = Math.max(5, node.width() * scaleX);
    const newHeight = Math.max(5, node.height() * scaleY);

    resizeElement(elementId, newWidth, newHeight);
    rotateElement(elementId, node.rotation());
    moveElement(elementId, node.x(), node.y());

    setIsResizing(false);
    setIsRotating(false);
    pushHistory('transform-element');
  }, [resizeElement, rotateElement, moveElement, setIsResizing, setIsRotating, pushHistory]);

  // Render element based on type
  const renderElement = (element: ScrapbookElement) => {
    const isSelected = selectedElementIds.includes(element.id);
    const commonProps = {
      id: element.id,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.rotation,
      opacity: element.opacity,
      draggable: true,
      onClick: (e: Konva.KonvaEventObject<MouseEvent>) => handleElementClick(e, element.id),
      onTap: (e: Konva.KonvaEventObject<MouseEvent>) => handleElementClick(e, element.id),
      onDragStart: () => setIsDragging(true),
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => handleDragEnd(e, element.id),
      onTransformStart: () => {
        setIsResizing(true);
        setIsRotating(true);
      },
      onTransformEnd: (e: Konva.KonvaEventObject<Event>) => handleTransformEnd(e, element.id),
      className: 'element',
    };

    switch (element.type) {
      case 'text':
        return (
          <Text
            key={element.id}
            {...commonProps}
            text={element.text || 'Text'}
            fontSize={element.fontSize || 16}
            fontFamily={element.fontFamily || 'Inter'}
            fill={element.color || '#333333'}
            width={element.width}
            height={element.height}
            align="center"
            verticalAlign="middle"
          />
        );
      case 'shape':
        if (element.shapeType === 'circle') {
          return (
            <Circle
              key={element.id}
              {...commonProps}
              radius={Math.min(element.width, element.height) / 2}
              fill={element.backgroundColor || '#c9bda8'}
            />
          );
        }
        return (
          <Rect
            key={element.id}
            {...commonProps}
            fill={element.backgroundColor || '#c9bda8'}
            cornerRadius={element.shapeType === 'rectangle' ? 4 : 0}
          />
        );
      case 'image':
        return (
          <Rect
            key={element.id}
            {...commonProps}
            fill="#e0d9ce"
            stroke="#c9bda8"
            strokeWidth={1}
          />
        );
      default:
        return (
          <Rect
            key={element.id}
            {...commonProps}
            fill="#c9bda8"
          />
        );
    }
  };

  if (!currentPage) return null;

  return (
    <div className="relative">
      <Stage
        ref={stageRef}
        width={pageWidth * zoom}
        height={pageHeight * zoom}
        scaleX={zoom}
        scaleY={zoom}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleStageClick}
        style={{ backgroundColor: currentPage.backgroundColor }}
        className="shadow-2xl"
      >
        <Layer>
          {/* Grid */}
          {showGrid && (
            <Group>
              {Array.from({ length: Math.ceil(pageWidth / 20) + 1 }).map((_, i) => (
                <Line
                  key={`v${i}`}
                  points={[i * 20, 0, i * 20, pageHeight]}
                  stroke="#e0d9ce"
                  strokeWidth={0.5}
                  opacity={0.5}
                />
              ))}
              {Array.from({ length: Math.ceil(pageHeight / 20) + 1 }).map((_, i) => (
                <Line
                  key={`h${i}`}
                  points={[0, i * 20, pageWidth, i * 20]}
                  stroke="#e0d9ce"
                  strokeWidth={0.5}
                  opacity={0.5}
                />
              ))}
            </Group>
          )}

          {/* Page border */}
          <Rect
            x={0}
            y={0}
            width={pageWidth}
            height={pageHeight}
            stroke="#333"
            strokeWidth={1}
            listening={false}
          />

          {/* Elements */}
          {currentPage.elements
            .slice()
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((element) => renderElement(element))}

          {/* Transformer */}
          <Transformer
            ref={transformerRef}
            flipEnabled={false}
            boundBoxFunc={(oldBox, newBox) => {
              if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                return oldBox;
              }
              return newBox;
            }}
            anchorSize={8}
            anchorStroke="#c9bda8"
            anchorFill="#252525"
            borderStroke="#c9bda8"
            borderStrokeWidth={1}
            rotateAnchorOffset={30}
            rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
            rotationSnapTolerance={5}
          />

          {/* Selection rectangle */}
          <Rect
            ref={selectionRectRef}
            x={selectionRect.x / zoom}
            y={selectionRect.y / zoom}
            width={selectionRect.width / zoom}
            height={selectionRect.height / zoom}
            fill="rgba(201, 189, 168, 0.2)"
            stroke="#c9bda8"
            strokeWidth={1}
            visible={selectionRect.visible}
            listening={false}
          />
        </Layer>
      </Stage>
    </div>
  );
}
