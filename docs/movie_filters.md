# Movie Discovery API Filters and Examples

## 🔹 Basic Options

  Parameter         Example   Description
  ----------------- --------- -------------------------------------
  `include_adult`   `false`   Exclude adult content
  `include_video`   `false`   Exclude movies that are only videos
  `language`        `en-US`   Response language
  `page`            `1`       Page number for pagination

## 🔹 Date & Year Filters

  ---------------------------------------------------------------------------
  Parameter                    Example            Description
  ---------------------------- ------------------ ---------------------------
  `primary_release_year`       `2024`             Only movies released in
                                                  2024

  `primary_release_date.gte`   `2024-01-01`       Released after Jan 1, 2024

  `primary_release_date.lte`   `2024-12-31`       Released before Dec 31,
                                                  2024

  `release_date.gte`           `2024-03-01`       Region-based release after
                                                  Mar 1, 2024

  `release_date.lte`           `2024-12-31`       Region-based release before
                                                  Dec 31, 2024

  `with_release_type`          `3|2`              `3 = Theatrical`,
                                                  `2 = Limited theatrical`
  ---------------------------------------------------------------------------

## 🔹 Rating & Votes

  Parameter                 Example   Description
  ------------------------- --------- ------------------------------------------
  `certification`           `PG-13`   Filter movies with certification PG-13
  `certification.gte`       `R`       Certification greater than or equal to R
  `certification.lte`       `PG`      Certification less than or equal to PG
  `certification_country`   `US`      Used with certification filters
  `vote_average.gte`        `7.0`     Minimum average rating
  `vote_average.lte`        `9.0`     Maximum average rating
  `vote_count.gte`          `100`     Minimum number of votes
  `vote_count.lte`          `1000`    Maximum number of votes

## 🔹 Sorting

  ---------------------------------------------------------------------------
  Parameter                 Example               Description
  ------------------------- --------------------- ---------------------------
  `sort_by`                 `popularity.desc`     Sort by popularity
                                                  descending (default)

                            `release_date.desc`   Sort by latest release

                            `vote_average.desc`   Sort by highest rating
  ---------------------------------------------------------------------------

## 🔹 Filter by People/Companies

  ------------------------------------------------------------------------
  Parameter                 Example            Description
  ------------------------- ------------------ ---------------------------
  `with_cast`               `500,3223`         Movies with BOTH cast
                                               members (IDs)

  `with_cast`               `500|3223`         Movies with EITHER cast
                                               member

  `with_crew`               `12835`            Movies by a specific crew
                                               member (e.g., director)

  `with_people`             `287,819`          AND logic for multiple
                                               people

  `with_people`             `287|819`          OR logic for multiple
                                               people

  `with_companies`          `420,25`           Movies by both companies

  `without_companies`       `9999`             Exclude movies from a
                                               company
  ------------------------------------------------------------------------

## 🔹 Content Filters

  Parameter                  Example         Description
  -------------------------- --------------- ------------------------------------
  `with_genres`              `28,12`         Must have Action **AND** Adventure
  `with_genres`              `28|12`         Must have Action **OR** Adventure
  `without_genres`           `35`            Exclude Comedy
  `with_keywords`            `action,hero`   Must include both keywords
  `without_keywords`         `romance`       Exclude romance keyword
  `with_origin_country`      `US`            Produced in the USA
  `with_original_language`   `hi`            Original language Hindi

## 🔹 Watch & Monetization

  --------------------------------------------------------------------------------
  Parameter                         Example            Description
  --------------------------------- ------------------ ---------------------------
  `watch_region`                    `IN`               Region: India

  `with_watch_providers`            `8`                Netflix provider ID

  `with_watch_providers`            `8|119`            Netflix OR Amazon Prime

  `without_watch_providers`         `337`              Exclude Apple TV

  `with_watch_monetization_types`   `flatrate,rent`    Include subscription and
                                                       rental
  --------------------------------------------------------------------------------

## 🔹 Runtime

  Parameter            Example   Description
  -------------------- --------- ---------------------
  `with_runtime.gte`   `90`      Minimum 90 minutes
  `with_runtime.lte`   `180`     Maximum 180 minutes

## Example Query

    https://api.themoviedb.org/3/discover/movie?api_key=YOUR_KEY
    &language=en-US
    &include_adult=false
    &primary_release_year=2024
    &with_genres=28|12
    &vote_average.gte=7
    &sort_by=popularity.desc
    &page=1
