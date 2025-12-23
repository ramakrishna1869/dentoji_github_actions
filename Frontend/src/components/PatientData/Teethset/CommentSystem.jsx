
// CommentSystem.js - Enhanced version with improved drag handling and tooth attachment

import React, { useState } from 'react';
import { MessageSquare, X, ChevronUp, Trash2, Pin, Unlink } from 'lucide-react';
import { FaTeeth } from 'react-icons/fa';
import { TbDental } from "react-icons/tb";
import { VscSend } from "react-icons/vsc";

// Enhanced Individual Comment Component with better visual indicators
export const CommentIcon = ({ 
    comment, 
    onCommentDown, 
    onCommentClick, 
    attachedToTooth = false,
    isDragging = false 
}) => (
    <div
        style={{ 
            position: 'absolute', 
            left: `${comment.x}px`, 
            top: `${comment.y}px`,
            zIndex: attachedToTooth ? 15 : 10,
            transition: isDragging ? 'none' : 'all 0.2s ease'
        }}
        className="comment-icon select-none"
        onPointerDown={(e) => onCommentDown(e, comment.id)}
        onClick={(e) => { 
            e.stopPropagation(); 
        }}
    >
        <div className={`relative rounded-full w-8 h-8 flex items-center justify-center text-black  transition-all duration-200 hover:scale-110 cursor-pointer ${
            comment.messages.length > 0 ? 'bg-transparent hover:bg-transparent' : 'bg-gray-400 hover:bg-gray-500'
        } ${attachedToTooth ? 'border-2 border-blue-400 ring-2 ring-blue-200' : ''} ${
            isDragging ? 'scale-110 shadow-2xl' : ''
        }`}>
            <TbDental className={`w-6 h-6 transition-transform ${isDragging ? 'scale-110' : ''}`} /> 
            
            {/* Tooth attachment indicator */}
            {attachedToTooth && (
                <Pin className="w-3 h-3 absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5 text-white shadow-md" />
            )}
            
            {/* Message count indicator */}
            {comment.messages.length > 0 && (
                <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {comment.messages.length > 9 ? '9+' : comment.messages.length}
                </div>
            )}
        </div>
        
        {/* Tooth ID tooltip */}
        {comment.toothId && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-white bg-opacity-85 text-white px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                Tooth {comment.toothId}
            </div>
        )}
        
        {/* Drag indicator */}
        {isDragging && (
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-xs bg-blue-600 text-white px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                Dragging...
            </div>
        )}
    </div>
);

// Enhanced Comment Modal Component with improved UI and tooth management
export const CommentModal = ({
    show,
    comments,
    currentCommentId,
    newCommentText,
    setNewCommentText,
    onClose,
    onAddMessage,
    onDeleteMessage,
    onDetachFromTooth
}) => {
    if (!show || !currentCommentId) return null;

    const currentComment = comments.find(c => c.id === currentCommentId);
    
    const handleAddMessage = (e) => {
        e.preventDefault();
        if (newCommentText.trim()) {
            onAddMessage();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddMessage(e);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl flex flex-col text-gray-200 max-h-[80vh] overflow-hidden">
                {/* Header with enhanced tooth attachment info */}
                <div className="flex justify-between items-start px-6 py-4 sticky top-0 bg-white-600 z-20 rounded-t-2xl border-b border-gray-700">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-black">Comment</h2>
                        {currentComment?.toothId && (
                            <div className="flex items-center space-x-2 mt-1">
                                <Pin className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-blue-400">
                                    Attached to Tooth {currentComment.toothId}
                                </span>
                                <button
                                    onClick={() => onDetachFromTooth(currentCommentId)}
                                    className="text-xs text-red-400 hover:text-red-300 underline flex items-center space-x-1 cursor-pointer"
                                    title="Detach from tooth"
                                >
                                    <Unlink className="w-3 h-3" />
                                    <span>Detach</span>
                                </button>
                            </div>
                        )}
                        {!currentComment?.toothId && (
                            <span className="text-sm text-black mt-1">Free-floating comment</span>
                        )}
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1 hover:bg-gray-800 rounded"
                        title="Close"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {/* Messages container with better scrolling */}
                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    {currentComment?.messages.map((msg) => (
                        <div key={msg.msgId} className="flex gap-3 mb-4 group">
                            <div className="rounded-full bg-gradient-to-br from-purple-600 to-purple-500 w-8 h-8 flex items-center justify-center text-white font-bold shrink-0 shadow-md">
                                U
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="font-medium text-black">
                                        udaysai
                                        <span className="text-black text-sm ml-2 font-normal">{msg.time}</span>
                                    </div>
                                    <button
                                        onClick={() => onDeleteMessage(currentCommentId, msg.msgId)}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 cursor-pointer transition-all p-1 hover:bg-red-900/20 rounded"
                                        title="Delete message"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-black break-words">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    
                    {currentComment?.messages.length === 0 && (
                        <div className="text-center py-8">
                            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <div className="text-gray-400">No messages yet</div>
                            <div className="text-gray-500 text-sm mt-1">Add the first comment below</div>
                        </div>
                    )}
                </div>
                
                {/* Input area with enhanced styling */}
 <div className="px-6 py-4 sticky bottom-0 bg-white-600 z-20 rounded-b-2xl border-t border-black">
    <form onSubmit={handleAddMessage} className="flex gap-3 items-center">
        <div className="rounded-full bg-gradient-to-br from-purple-600 to-purple-500 w-10 h-10 flex items-center justify-center text-white font-bold shrink-0 shadow-md">
            U
        </div>
        <div className="flex-1">
            <textarea
                className="w-full p-2 mt-1 bg-white border border-black rounded-lg text-black-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors h-10 overflow-hidden"
                placeholder="Add a comment..."
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
            />
        </div>
        <button 
            type="submit"
            className="text-black cursor-pointer disabled:cursor-not-allowed bg-white p-2 rounded-lg transition-colors shadow-md h-10 w-10 flex items-center justify-center"
            disabled={!newCommentText.trim()}
            title="Send message"
        >
            <VscSend className="w-5 h-5" />
        </button>
    </form>
</div>
            </div>
        </div>
    );
};

// Main Enhanced Comment System Component
const CommentSystem = ({
    comments,
    isAddingComment,
    draggingCommentId,
    currentCommentId,
    newCommentText,
    showCommentModal,
    onContainerClick,
    onCommentDown,
    onCommentClick,
    onAddMessage,
    onDeleteMessage,
    onCloseModal,
    onDetachFromTooth,
    setNewCommentText,
    containerRef
}) => {
    return (
        <>
            {/* Render all comment icons with enhanced styling */}
            {comments.map((comment) => (
                <CommentIcon
                    key={comment.id}
                    comment={comment}
                    onCommentDown={onCommentDown}
                    onCommentClick={onCommentClick}
                    attachedToTooth={!!comment.toothId}
                    isDragging={draggingCommentId === comment.id}
                />
            ))}

            {/* Enhanced Comment Modal */}
            <CommentModal
                show={showCommentModal}
                comments={comments}
                currentCommentId={currentCommentId}
                newCommentText={newCommentText}
                setNewCommentText={setNewCommentText}
                onClose={onCloseModal}
                onAddMessage={onAddMessage}
                onDeleteMessage={onDeleteMessage}
                onDetachFromTooth={onDetachFromTooth}
            />

            {/* Enhanced Comment Mode Indicator */}
            {isAddingComment && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-30">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-3 animate-pulse">
                        <MessageSquare className="w-5 h-5" />
                        <div className="text-sm font-medium">
                            <div>Comment Mode Active</div>
                            <div className="text-blue-200 text-xs">
                                Click teeth to attach • Click elsewhere for free comments
                            </div>
                        </div>
                        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    </div>
                </div>
            )}

            {/* Comment count indicator */}
            {comments.length > 0 && !isAddingComment && (
                <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg z-30">
                    <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm font-medium">
                            {comments.length} comment{comments.length !== 1 ? 's' : ''}
                        </span>
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span className="text-xs text-gray-400">
                            {comments.reduce((total, comment) => total + comment.messages.length, 0)} message{comments.reduce((total, comment) => total + comment.messages.length, 0) !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            )}

            {/* Custom CSS for scrollbar */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #374151;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #6b7280;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }
            `}</style>
        </>
    );
};

export default CommentSystem;