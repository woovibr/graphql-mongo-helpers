import { Types } from 'mongoose';

export const conditionId = (id: string | null) => {
  if (!id || !Types.ObjectId.isValid(id)) {
    return [];
  }

  return [
    {
      _id: new Types.ObjectId(id),
    },
  ];
};
