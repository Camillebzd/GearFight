import { Badge } from "@chakra-ui/react";

const DifficultyBadge = ({difficulty}: {difficulty: number}) => {
  const difficultyColor = () => {
    switch (difficulty) {
      case 1:
        return "yellow";
      case 2:
        return 'orange';
      case 4:
        return 'red';
      default:
        return 'white';
    }
  };
  const difficultyTitle = () => {
    switch (difficulty) {
      case 1:
        return "easy";
      case 2:
        return 'medium';
      case 4:
        return 'hard';
      default:
        return 'Unknown';
    }
  };

  return (
    <Badge colorScheme={difficultyColor()}>{difficultyTitle()}</Badge>
  );
}

export default DifficultyBadge;