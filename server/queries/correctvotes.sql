-
UPDATE reviews r
SET 
  upvotes = (
    SELECT COUNT(*) 
    FROM review_votes rv 
    WHERE rv.Upvote = TRUE AND rv.ReviewID = r.id
  ),
  downvotes = (
    SELECT COUNT(*) 
    FROM review_votes rv 
    WHERE rv.Upvote = FALSE AND rv.ReviewID = r.id
  );