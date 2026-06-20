import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const RELATIONSHIP_ORDER = [
  'Grandparent', 'Grandmother', 'Grandfather',
  'Parent', 'Mother', 'Father',
  'Child', 'Son', 'Daughter',
  'Grandchild', 'Grandchildren',
  'Sibling', 'Brother', 'Sister',
  'Aunt', 'Uncle', 'Cousin',
  'Spouse', 'Partner',
  'Other',
];

function groupByRelationship(members) {
  const groups = {};
  members.forEach(member => {
    const rel = member.relationship || 'Other';
    if (!groups[rel]) groups[rel] = [];
    groups[rel].push(member);
  });
  return groups;
}

function TreeNode({ member }) {
  return (
    <Link to={`/members/${member.id}`}>
      <div className="flex flex-col items-center group cursor-pointer">
        <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-amber-300 group-hover:border-amber-500 transition-colors shadow-md">
          {member.photo_path ? (
            <img
              src={member.photo_path}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-2xl">
              👤
            </div>
          )}
        </div>
        <div className="mt-2 text-center max-w-20">
          <p className="text-xs font-bold text-stone-700 truncate leading-tight">{member.name}</p>
          {member.relationship && (
            <p className="text-xs text-amber-600 truncate leading-tight">{member.relationship}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function FamilyTree({ members }) {
  const groups = groupByRelationship(members);

  // Sort group keys by relationship order
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    const ai = RELATIONSHIP_ORDER.findIndex(r => a.toLowerCase().includes(r.toLowerCase()));
    const bi = RELATIONSHIP_ORDER.findIndex(r => b.toLowerCase().includes(r.toLowerCase()));
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  if (members.length === 0) {
    return (
      <div className="text-center py-16 text-stone-400">
        <div className="text-5xl mb-3">🌳</div>
        <p className="font-medium">No family members yet</p>
        <p className="text-sm mt-1">Add members to see the family tree</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        {sortedKeys.map((relationship, groupIndex) => {
          const groupMembers = groups[relationship];
          return (
            <div key={relationship} className="mb-8">
              {/* Generation label */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-amber-200"></div>
                <span className="text-sm font-semibold text-amber-600 px-3 py-1 bg-amber-100 rounded-full">
                  {relationship}
                </span>
                <div className="h-px flex-1 bg-amber-200"></div>
              </div>

              {/* Members row */}
              <div className="relative">
                {/* Horizontal connector line */}
                {groupMembers.length > 1 && (
                  <div
                    className="absolute top-8 left-0 right-0 h-0.5 bg-amber-200"
                    style={{ marginLeft: '32px', marginRight: '32px' }}
                  />
                )}

                <div className="flex justify-center gap-8 flex-wrap">
                  {groupMembers.map(member => (
                    <div key={member.id} className="relative flex flex-col items-center">
                      {/* Vertical connector from line above */}
                      {groupIndex > 0 && (
                        <div className="w-0.5 h-4 bg-amber-200 mb-1" />
                      )}
                      <TreeNode member={member} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
