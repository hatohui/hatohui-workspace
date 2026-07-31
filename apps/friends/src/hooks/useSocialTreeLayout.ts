import { useMemo } from 'react';
import type { SocialGraphNodeDto, FriendDto } from '@hatohui/models';

export type SocialTreeNode = {
  key: string;
  friend: FriendDto;
  parentName: string | null;
  x: number;
  y: number;
  depth: 1 | 2;
};

export type SocialTreeEdge = {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  opacity: number;
};

export const SOCIAL_TREE_SIZE = 400;
const CENTER = SOCIAL_TREE_SIZE / 2;
const RADIUS_1 = 110;
const RADIUS_2 = 185;

export function useSocialTreeLayout(graphNodes: SocialGraphNodeDto[]) {
  return useMemo(() => {
    const nodes: SocialTreeNode[] = [];
    const edges: SocialTreeEdge[] = [];
    const count = graphNodes.length;
    if (count === 0) return { nodes, edges };

    const slice = (2 * Math.PI) / count;

    graphNodes.forEach(({ friend, friendsOfFriend }, i) => {
      const angle = i * slice - Math.PI / 2;
      const x1 = CENTER + RADIUS_1 * Math.cos(angle);
      const y1 = CENTER + RADIUS_1 * Math.sin(angle);

      nodes.push({
        key: friend.id,
        friend,
        parentName: null,
        x: x1,
        y: y1,
        depth: 1,
      });
      edges.push({
        key: `edge-${friend.id}`,
        x1: CENTER,
        y1: CENTER,
        x2: x1,
        y2: y1,
        opacity: 0.5,
      });

      const childCount = friendsOfFriend.length;
      if (childCount === 0) return;

      const arc = slice * 0.7;
      const step = childCount > 1 ? arc / (childCount - 1) : 0;
      const startAngle = angle - arc / 2;

      friendsOfFriend.forEach((fof, j) => {
        const childAngle = childCount > 1 ? startAngle + j * step : angle;
        const x2 = CENTER + RADIUS_2 * Math.cos(childAngle);
        const y2 = CENTER + RADIUS_2 * Math.sin(childAngle);

        nodes.push({
          key: `${friend.id}-${fof.id}`,
          friend: fof,
          parentName: friend.name,
          x: x2,
          y: y2,
          depth: 2,
        });
        edges.push({
          key: `edge-${friend.id}-${fof.id}`,
          x1,
          y1,
          x2,
          y2,
          opacity: 0.3,
        });
      });
    });

    return { nodes, edges };
  }, [graphNodes]);
}
