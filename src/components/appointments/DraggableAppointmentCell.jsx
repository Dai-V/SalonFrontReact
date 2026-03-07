import { useDraggable } from '@dnd-kit/react';

export default function DraggableAppointmentCell({ id, rowSpan, style, onMouseEnter, onMouseLeave, onClick, children }) {
    const { ref, isDragging } = useDraggable({ id });
    return (
        <td
            ref={ref}
            rowSpan={rowSpan}
            style={{
                ...style,
                opacity: isDragging ? 0.4 : 1,
                cursor: isDragging ? 'grabbing' : 'grab',
                transition: 'opacity 0.15s',
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
        >
            {children}
        </td>
    );
}